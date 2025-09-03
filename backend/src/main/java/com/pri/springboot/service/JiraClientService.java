package com.pri.springboot.service;

import com.pri.springboot.dto.JiraQueryRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class JiraClientService {
    private static final int MAX_RESULTS_LIMIT = 1000; // Jira's maximum per request
    private static final int DEFAULT_BATCH_SIZE = 200; // Reasonable batch size for pagination
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetches all issues matching the JQL query with automatic pagination
     * @param request The Jira query request containing credentials and parameters
     * @param jql The JQL query string
     * @return JSON string containing all matching issues
     * @throws JsonProcessingException if there's an error processing the JSON response
     */
    public String fetchIssues(JiraQueryRequest request, String jql) throws JsonProcessingException {
        RestTemplate restTemplate = new RestTemplate();
        StringBuilder allIssuesJson = new StringBuilder("{\"issues\":[");
        boolean isFirstPage = true;
        String nextPageToken = null;
        int totalProcessed = 0;
        
        // If maxResults is not set (0), we'll fetch all pages
        boolean fetchAll = request.getMaxResults() <= 0;
        int requestedMaxResults = Math.max(0, request.getMaxResults());
        int batchSize = fetchAll ? DEFAULT_BATCH_SIZE : Math.min(requestedMaxResults, MAX_RESULTS_LIMIT);

        do {
            // Calculate how many results to fetch in this batch
            int currentBatchSize = fetchAll ? batchSize : Math.min(batchSize, requestedMaxResults - totalProcessed);
            
            // Fetch a page of results
            String pageJson = fetchIssuesPage(restTemplate, request, jql, currentBatchSize, nextPageToken);
            JsonNode pageNode = objectMapper.readTree(pageJson);
            
            // Extract issues array
            JsonNode issuesNode = pageNode.get("issues");
            int issuesInBatch = issuesNode.size();
            
            // If this is not the first page, add a comma before appending new issues
            if (!isFirstPage && issuesInBatch > 0) {
                allIssuesJson.append(",");
            } else if (issuesInBatch > 0) {
                isFirstPage = false;
            }
            
            // Append the issues (removing the surrounding [ ] from the array)
            if (issuesInBatch > 0) {
                String issuesStr = issuesNode.toString();
                allIssuesJson.append(issuesStr, 1, issuesStr.length() - 1);
            }
            
            // Update pagination state
            totalProcessed += issuesInBatch;
            nextPageToken = pageNode.has("nextPageToken") ? pageNode.get("nextPageToken").asText() : null;
            
            // Log progress
            System.out.println(String.format("Fetched %d issues (total: %d)", issuesInBatch, totalProcessed));
            
            // Stop if we've reached the requested maximum or there are no more pages
        } while (nextPageToken != null && (fetchAll || totalProcessed < requestedMaxResults) && (fetchAll || totalProcessed < requestedMaxResults));
        
        allIssuesJson.append("],\"total\":" + totalProcessed + "}");
        return allIssuesJson.toString();
    }
    
    private String fetchIssuesPage(RestTemplate restTemplate, JiraQueryRequest request, 
                                 String jql, int maxResults, String nextPageToken) {

        // Auth
        String auth = request.getEmail() + ":" + request.getToken();
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        String authHeader = "Basic " + new String(encodedAuth);

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Accept", "application/json");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Ensure we have fields to fetch
        if (request.getFieldsToReturn() == null || request.getFieldsToReturn().isEmpty()) {
            throw new IllegalArgumentException("At least one field must be specified in fieldsToReturn");
        }
        String fieldsToFetch = String.join(",", request.getFieldsToReturn());
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(request.getUrl())
                .path("/rest/api/3/search/jql")
                .queryParam("jql", jql)
                .queryParam("fields", fieldsToFetch)
                .queryParam("maxResults", Math.min(maxResults, MAX_RESULTS_LIMIT));
                
        if (nextPageToken != null) {
            builder = builder.queryParam("nextPageToken", nextPageToken);
        }
        
        String url = builder.build().toUriString();

System.out.println("GET URL naar Jira: " + url);
        System.out.println("Query jql: " + jql);
        System.out.println("Fields: " + fieldsToFetch);
        System.out.println("Max results: " + maxResults);
        if (nextPageToken != null) {
            System.out.println("Using nextPageToken for pagination");
        }

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            
            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Jira API request failed with status: " + response.getStatusCode());
            }
            
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error fetching issues from Jira: " + e.getMessage());
            throw new RuntimeException("Failed to fetch issues from Jira", e);
        }
    }
    
}
