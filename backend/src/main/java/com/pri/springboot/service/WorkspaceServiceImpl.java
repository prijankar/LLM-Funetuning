package com.pri.springboot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pri.springboot.dto.*;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.entity.ImportedData;
import com.pri.springboot.repository.DataSourceRepository;
import com.pri.springboot.repository.ImportedDataRepository;
import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.ArrayList;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class WorkspaceServiceImpl implements WorkspaceService {

    private final DataSourceRepository dataSourceRepository;
    private final ImportedDataRepository importedDataRepository;
    private final ModelMapper modelMapper;
    private final JiraClientService jiraClientService;
    private final StringEncryptor encryptor;
    private final ObjectMapper objectMapper;

    @Override
    public List<SyncedProjectDto> getSyncedProjects() {
        return dataSourceRepository.findAll().stream()
                .filter(ds -> "JIRA".equals(ds.getType()) && "SYNCED".equals(ds.getStatus()))
                .map(ds -> modelMapper.map(ds, SyncedProjectDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<ImportedDataDto> getImportedData(Long dataSourceId) {
        return importedDataRepository.findByDataSourceId(dataSourceId)
                .stream()
                .map(this::convertToDto) // Use a helper method to map
                .collect(Collectors.toList());
    }

    // Add this private helper method to the class
    private ImportedDataDto convertToDto(ImportedData importedData) {
        ImportedDataDto dto = new ImportedDataDto();
        dto.setId(importedData.getId());
        dto.setRawContent(importedData.getRawContent());
        if (importedData.getDataSource() != null) {
            dto.setDataSourceId(importedData.getDataSource().getId());
        }
        return dto;
    }

    @Override
    public List<JsonNode> queryJiraIssues(Long dataSourceId, JiraQueryFilterDto filters) throws Exception {
        // --- Step 1: Create the 'details' object (This was missing) ---
        DataSource dataSource = dataSourceRepository.findById(dataSourceId)
                .orElseThrow(() -> new RuntimeException("DataSource not found"));
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);
        // ---------------------------------------------------------------

        String projectKey = details.get("projectKey").asText();

        // --- Step 2: Create the 'jql' object (This was missing) ---
        StringBuilder jql = new StringBuilder("project = " + projectKey);
        if (filters.getStatus() != null && !filters.getStatus().isEmpty()) {
            jql.append(" AND status = '").append(filters.getStatus()).append("'");
        }
        if (filters.getIssueTypes() != null && !filters.getIssueTypes().isEmpty()) {
            String issueTypesString = filters.getIssueTypes().stream()
                    .map(it -> "'" + it + "'")
                    .collect(Collectors.joining(","));
            jql.append(" AND issueType in (").append(issueTypesString).append(")");
        }
        // -----------------------------------------------------------

        // --- Step 3: Prepare and execute the request ---
        // This part of your code can now use 'details' and 'jql'
        JiraQueryRequest jiraRequest = new JiraQueryRequest();
        jiraRequest.setUrl(details.get("url").asText());
        jiraRequest.setEmail(details.get("email").asText());
        jiraRequest.setToken(details.get("token").asText());
        jiraRequest.setFieldsToReturn(List.of("summary", "description", "status", "issuetype", "key"));

        String jsonResponseString = jiraClientService.fetchIssues(jiraRequest, jql.toString());
        JsonNode rootNode = objectMapper.readTree(jsonResponseString);
        JsonNode issuesArrayNode = rootNode.get("issues");

        if (issuesArrayNode != null && issuesArrayNode.isArray()) {
            return objectMapper.convertValue(issuesArrayNode,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, JsonNode.class));
        }

        return List.of();
    }

    @Override
    public JiraProjectMetadataDto getJiraMetadata(Long dataSourceId) throws Exception {
        // 1. Get data source and decrypt credentials
        DataSource dataSource = dataSourceRepository.findById(dataSourceId)
                .orElseThrow(() -> new RuntimeException("DataSource not found"));
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);

        String projectKey = details.get("projectKey").asText();
        String jiraUrl = details.get("url").asText();
        String email = details.get("email").asText();
        String token = details.get("token").asText();

        // 2. Prepare authenticated request to Jira
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        String auth = email + ":" + token;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + new String(encodedAuth));
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // 3. Fetch project details, which includes issue types
        String projectUrl = jiraUrl + "/rest/api/3/project/" + projectKey;
        ResponseEntity<JsonNode> projectResponse = restTemplate.exchange(projectUrl, HttpMethod.GET, entity, JsonNode.class);

        List<String> issueTypes = new ArrayList<>();
        if (projectResponse.getBody() != null && projectResponse.getBody().has("issueTypes")) {
            for (JsonNode issueTypeNode : projectResponse.getBody().get("issueTypes")) {
                issueTypes.add(issueTypeNode.get("name").asText());
            }
        }

        // 4. Fetch statuses for the project
        String statusesUrl = jiraUrl + "/rest/api/3/project/" + projectKey + "/statuses";
        ResponseEntity<JsonNode> statusesResponse = restTemplate.exchange(statusesUrl, HttpMethod.GET, entity, JsonNode.class);

        List<String> statuses = new ArrayList<>();
        if (statusesResponse.getBody() != null && statusesResponse.getBody().isArray()) {
            for (JsonNode statusTypeNode : statusesResponse.getBody()) {
                // Jira nests statuses inside a "statuses" array for each issue type
                for (JsonNode statusNode : statusTypeNode.get("statuses")) {
                    String statusName = statusNode.get("name").asText();
                    if (!statuses.contains(statusName)) { // Add only unique statuses
                        statuses.add(statusName);
                    }
                }
            }
        }

        // 5. Populate and return the DTO
        JiraProjectMetadataDto metadataDto = new JiraProjectMetadataDto();
        metadataDto.setIssueTypes(issueTypes);
        metadataDto.setStatuses(statuses);

        return metadataDto;
    }
}
