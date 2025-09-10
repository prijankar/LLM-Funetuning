package com.pri.springboot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import com.pri.springboot.dto.JiraQueryRequest;
import com.pri.springboot.dto.TestJiraConnectionRequest;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.entity.ImportedData;
import com.pri.springboot.entity.TrainingIssue;    
import com.pri.springboot.repository.DataSourceRepository;
import com.pri.springboot.repository.ImportedDataRepository;
import com.pri.springboot.repository.TrainingIssueRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataSourceServiceImpl implements DataSourceService {

    // All required dependencies
    private final DataSourceRepository dataSourceRepository;
    private final TrainingIssueRepository trainingIssueRepository;
    private final JiraClientService jiraClientService;
    private final ModelMapper modelMapper;
    private final StringEncryptor encryptor;
    private final ObjectMapper objectMapper;
    private final ImportedDataRepository importedDataRepository;

    @Override
    public List<DataSourceDto> getAllDataSources() {
        return dataSourceRepository.findAll().stream()
                .map(dataSource -> {
                    // First, map the basic fields
                    DataSourceDto dto = modelMapper.map(dataSource, DataSourceDto.class);

                    // Now, parse the connectionDetails to extract extra info
                    try {
                        // We must DECRYPT before parsing
                        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
                        JsonNode details = objectMapper.readTree(decryptedDetails);

                        if ("JIRA".equals(dataSource.getType())) {
                            if (details.has("url")) {
                                dto.setUrl(details.get("url").asText());
                            }
                            if (details.has("projectKey")) {
                                dto.setProjectKey(details.get("projectKey").asText());
                            }
                        }
                        // Add else-if blocks here for other types like DATABASE later
                    } catch (Exception e) {
                        // If parsing fails, set them to a default value
                        dto.setUrl("N/A");
                        dto.setProjectKey("N/A");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public DataSourceDto createDataSource(CreateDataSourceRequest request) {
        DataSource dataSource = new DataSource();
        dataSource.setName(request.getName());
        dataSource.setType(request.getType());
        String encryptedDetails = encryptor.encrypt(request.getConnectionDetails());
        dataSource.setConnectionDetails(encryptedDetails);
        dataSource.setStatus("NOT_CONNECTED");
        DataSource savedDataSource = dataSourceRepository.save(dataSource);
        return modelMapper.map(savedDataSource, DataSourceDto.class);
    }

    @Override
    public void deleteDataSource(Long id) {
        if (!dataSourceRepository.existsById(id)) {
            throw new RuntimeException("DataSource not found with id: " + id);
        }
        dataSourceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void syncDataSource(Long id) throws Exception {
        // Step 1: Find the saved data source configuration
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DataSource not found with id: " + id));

        // Step 2: Decrypt the connection details
        String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
        JsonNode details = objectMapper.readTree(decryptedDetails);
        String projectKey = details.get("projectKey").asText();

        // Step 3: Prepare the Jira request
        JiraQueryRequest jiraRequest = new JiraQueryRequest();
        jiraRequest.setUrl(details.get("url").asText());
        jiraRequest.setEmail(details.get("email").asText());
        jiraRequest.setToken(details.get("token").asText());
        // Request all the fields you want to have available for training
        jiraRequest.setFieldsToReturn(List.of("summary", "description", "status", "issuetype", "reporter", "assignee", "timespent", "labels", "timeoriginalestimate"));

        // Build a broad JQL to fetch everything for the project
        String jql = String.format("project = '%s'", projectKey);

        // Step 4: Fetch all issues from Jira
        String rawJsonResponse = jiraClientService.fetchIssues(jiraRequest, jql);
        JsonNode rootNode = objectMapper.readTree(rawJsonResponse);
        JsonNode issuesNode = rootNode.get("issues");

        // Step 5: Perform the "Full Refresh"
        // First, delete all old data for this source
        importedDataRepository.deleteByDataSourceId(id);

        // Then, loop through the new data and save it
        if (issuesNode != null && issuesNode.isArray()) {
            for (JsonNode issueNode : issuesNode) {
                ImportedData newRecord = new ImportedData();
                newRecord.setDataSource(dataSource);
                newRecord.setRawContent(issueNode.toString());
                importedDataRepository.save(newRecord);
            }
        }

        // Step 6: Update the status of the data source
        dataSource.setStatus("SYNCED");
        dataSourceRepository.save(dataSource);
    }

    @Override
    public DataSourceDto updateDataSource(Long id, CreateDataSourceRequest request) {
        // Find the existing data source or throw an error
        DataSource existingDataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DataSource not found with id: " + id));

        // Update the properties
        existingDataSource.setName(request.getName());
        existingDataSource.setType(request.getType());

        // Re-encrypt the connection details and save them
        String encryptedDetails = encryptor.encrypt(request.getConnectionDetails());
        existingDataSource.setConnectionDetails(encryptedDetails);

        DataSource updatedDataSource = dataSourceRepository.save(existingDataSource);

        return modelMapper.map(updatedDataSource, DataSourceDto.class);
    }

    // ADD THIS HELPER METHOD to the same class
    private String getNodeText(JsonNode parentNode, String fieldName) {
        JsonNode node = parentNode.get(fieldName);
        if (node == null || node.isNull()) {
            throw new IllegalArgumentException("'" + fieldName + "' is missing from the connection details.");
        }
        return node.asText();
    }

    @Override
    public boolean testJiraConnection(TestJiraConnectionRequest request) {
        // The Jira API endpoint to get project details is a great way to test a connection
        String testUrl = request.getUrl() + "/rest/api/3/project/" + request.getProjectKey();

        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. Create Basic Auth credentials
            String auth = request.getEmail() + ":" + request.getToken();
            byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
            String authHeader = "Basic " + new String(encodedAuth);

            // 2. Set the Authorization header
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 3. Make the actual API call to Jira
            ResponseEntity<String> response = restTemplate.exchange(testUrl, HttpMethod.GET, entity, String.class);

            // 4. If the status code is 200 (OK), the connection is successful
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            // If the call fails for any reason (401 Unauthorized, 404 Not Found, etc.),
            // the connection is invalid.
            return false;
        }
     }
    @Override
    public boolean testSavedConnection(Long id) {
        // 1. Find the saved data source
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DataSource not found with id: " + id));

        try {
            // 2. Decrypt the details
            String decryptedDetails = encryptor.decrypt(dataSource.getConnectionDetails());
            JsonNode details = objectMapper.readTree(decryptedDetails);

            // 3. Build a test request and call the existing test logic
            TestJiraConnectionRequest testRequest = new TestJiraConnectionRequest();
            testRequest.setUrl(details.get("url").asText());
            testRequest.setEmail(details.get("email").asText());
            testRequest.setToken(details.get("token").asText());
            testRequest.setProjectKey(details.get("projectKey").asText());

            boolean isSuccess = this.testJiraConnection(testRequest);

            // 4. Update the status in the database
            dataSource.setStatus(isSuccess ? "CONNECTED" : "ERROR");
            dataSourceRepository.save(dataSource);

            return isSuccess;
        } catch (Exception e) {
            dataSource.setStatus("ERROR");
            dataSourceRepository.save(dataSource);
            return false;
        }
    }

}