package com.pri.springboot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pri.springboot.dto.*;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.repository.DataSourceRepository;
import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SprintExplorerServiceImpl implements SprintExplorerService {

    private final DataSourceRepository dataSourceRepository;
    private final JiraClientService jiraClientService;
    private final StringEncryptor encryptor;
    private final ObjectMapper objectMapper;

    @Override
    public SprintViewDto getSprintView(Long dataSourceId, String sprintName) throws Exception {
        // 1. Get data source and decrypt credentials
        DataSource dataSource = dataSourceRepository.findById(dataSourceId)
                .orElseThrow(() -> new RuntimeException("DataSource not found"));
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);

        // 2. Prepare Jira Request
        JiraQueryRequest jiraRequest = new JiraQueryRequest();
        jiraRequest.setUrl(details.get("url").asText());
        jiraRequest.setEmail(details.get("email").asText());
        jiraRequest.setToken(details.get("token").asText());
        // Define all fields needed for the view
        jiraRequest.setFieldsToReturn(List.of("summary", "issuetype", "status", "parent"));

        // 3. Build JQL to get all issues in the specified sprint
        String jql = String.format("sprint = '%s'", sprintName);
        String jsonResponse = jiraClientService.fetchIssues(jiraRequest, jql);
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode issuesNode = root.get("issues");

        // 4. Process and group the issues
        SprintViewDto sprintView = new SprintViewDto();
        sprintView.setSprintName(sprintName);
        Map<String, EpicDto> epicsMap = new HashMap<>();

        if (issuesNode != null && issuesNode.isArray()) {
            for (JsonNode issueJson : issuesNode) {
                IssueDto issueDto = new IssueDto();
                issueDto.setKey(issueJson.path("key").asText());
                issueDto.setSummary(issueJson.path("fields").path("summary").asText());
                issueDto.setType(issueJson.path("fields").path("issuetype").path("name").asText());
                issueDto.setStatus(issueJson.path("fields").path("status").path("name").asText());

                // Check if the issue has a parent epic
                JsonNode parentNode = issueJson.path("fields").path("parent");
                if (!parentNode.isMissingNode() && parentNode.has("id")) {
                    String epicKey = parentNode.path("key").asText();
                    String epicName = parentNode.path("fields").path("summary").asText();

                    // Get or create the EpicDto and add the issue to it
                    EpicDto epicDto = epicsMap.computeIfAbsent(epicKey, k -> {
                        EpicDto newEpic = new EpicDto();
                        newEpic.setEpicKey(k);
                        newEpic.setEpicName(epicName);
                        return newEpic;
                    });
                    epicDto.getIssues().add(issueDto);
                } else {
                    // This is a "loose" issue, not belonging to an epic
                    sprintView.getIssuesWithoutEpic().add(issueDto);
                }
            }
        }
        sprintView.getEpics().addAll(epicsMap.values());
        return sprintView;
    }

    @Override
    public List<String> getSprints(Long dataSourceId) throws Exception {
        // 1. Get data source and decrypt credentials
        DataSource dataSource = dataSourceRepository.findById(dataSourceId)
                .orElseThrow(() -> new RuntimeException("DataSource not found"));
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);

        String jiraUrl = details.get("url").asText();
        String email = details.get("email").asText();
        String token = details.get("token").asText();
        String projectKey = details.get("projectKey").asText();

        // 2. Prepare for live Jira API calls
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        String auth = email + ":" + token;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + new String(encodedAuth));
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // 3. First, find the Board ID for the project
        String boardApiUrl = jiraUrl + "/rest/agile/1.0/board?projectKeyOrId=" + projectKey;
        ResponseEntity<JsonNode> boardResponse = restTemplate.exchange(boardApiUrl, HttpMethod.GET, entity, JsonNode.class);

        JsonNode values = boardResponse.getBody().path("values");
        if (values.isEmpty()) {
            throw new RuntimeException("No Agile boards found for project: " + projectKey);
        }
        // Use the ID of the first board found
        long boardId = values.get(0).path("id").asLong();

        // 4. Now, fetch all sprints for that Board ID
        String sprintApiUrl = jiraUrl + "/rest/agile/1.0/board/" + boardId + "/sprint";
        ResponseEntity<JsonNode> sprintResponse = restTemplate.exchange(sprintApiUrl, HttpMethod.GET, entity, JsonNode.class);

        List<String> sprintNames = new ArrayList<>();
        JsonNode sprintValues = sprintResponse.getBody().path("values");
        if (sprintValues != null && sprintValues.isArray()) {
            for (JsonNode sprintNode : sprintValues) {
                sprintNames.add(sprintNode.path("name").asText());
            }
        }

        return sprintNames;

}}