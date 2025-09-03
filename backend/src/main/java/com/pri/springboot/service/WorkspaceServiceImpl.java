package com.pri.springboot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pri.springboot.dto.JiraQueryRequest;
import com.pri.springboot.dto.SyncedProjectDto;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.entity.ImportedData;
import com.pri.springboot.repository.DataSourceRepository;
import com.pri.springboot.repository.ImportedDataRepository;
import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.pri.springboot.dto.JiraQueryFilterDto;
import com.fasterxml.jackson.databind.JsonNode;

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
    public List<ImportedData> getImportedData(Long dataSourceId) {
        return importedDataRepository.findByDataSourceId(dataSourceId);
    }

    @Override
    public List<JsonNode> queryJiraIssues(Long dataSourceId, JiraQueryFilterDto filters) throws Exception {
        // 1. Get the data source and decrypt credentials
        DataSource dataSource = dataSourceRepository.findById(dataSourceId)
                .orElseThrow(() -> new RuntimeException("DataSource not found"));
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);
        // ------------------------------------

        String projectKey = details.get("projectKey").asText();

        // 2. Build the JQL Query Dynamically
        StringBuilder jql = new StringBuilder("project = " + projectKey);
        if (filters.getStatus() != null && !filters.getStatus().isEmpty()) {
            jql.append(" AND status = '").append(filters.getStatus()).append("'");
        }
        // ... add other filters as needed ...

        // 3. Prepare and execute the request
        JiraQueryRequest jiraRequest = new JiraQueryRequest();
        // Now the 'details' object exists and these lines will work
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
}
