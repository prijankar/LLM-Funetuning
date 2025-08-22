package com.pri.springboot.controller;

import com.pri.springboot.dto.JiraQueryRequest;
import com.pri.springboot.service.JiraClientService;
import com.pri.springboot.service.JqlBuilderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/jira")
public class JiraController {

    private final JiraClientService jiraClientService;
    private final JqlBuilderService jqlBuilderService;

    @Autowired
    public JiraController(JiraClientService jiraClientService, JqlBuilderService jqlBuilderService) {
        this.jiraClientService = jiraClientService;
        this.jqlBuilderService = jqlBuilderService;
    }

    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    @PostMapping("/fetch-dynamic")
    public ResponseEntity<?> fetchJiraDataDynamic(@RequestBody JiraQueryRequest queryRequest) {
        try {
            String jql = jqlBuilderService.buildJql(queryRequest);
            String issuesJson = jiraClientService.fetchIssues(queryRequest, jql);
            return ResponseEntity.ok(issuesJson);
        } catch (Exception e) {
            System.err.println("Fout in JiraController: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"Kon data niet ophalen van Jira.\"}");
        }
    }
}