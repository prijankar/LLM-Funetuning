package com.pri.springboot.dto;

import java.util.List;

public class JiraQueryRequest {
    // Credentials
    private String url;
    private String email;
    private String token;

    // Dynamic Query Parts
    private String projectKey;
    private List<String> statuses;
    private List<String> fieldsToReturn;
    
    // Pagination
    private int maxResults = 1000; // Default to max allowed by Jira
    private String nextPageToken; // For pagination with enhanced search

    // Getters and Setters for all fields...
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email; }
    public String getToken() { return token;
    }
    public void setToken(String token) {
        this.token = token; }
    public String getProjectKey() { return projectKey;
    }
    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }
    public List<String> getStatuses() {
        return statuses; }
    public void setStatuses(List<String> statuses) { this.statuses = statuses;
    }
    public List<String> getFieldsToReturn() {
        return fieldsToReturn; }
    public void setFieldsToReturn(List<String> fieldsToReturn) {
        this.fieldsToReturn = fieldsToReturn;
    }
    public List<String> getSelectedKeys() {
        return selectedKeys;
    }

    public void setSelectedKeys(List<String> selectedKeys) {
        this.selectedKeys = selectedKeys;
    }

    public int getMaxResults() {
        return maxResults;
    }
    
    public void setMaxResults(int maxResults) {
        this.maxResults = Math.min(maxResults, 1000); // Jira max is 1000
    }
    
    public String getNextPageToken() {
        return nextPageToken;
    }
    
    public void setNextPageToken(String nextPageToken) {
        this.nextPageToken = nextPageToken;
    }

    private List<String> selectedKeys;




}