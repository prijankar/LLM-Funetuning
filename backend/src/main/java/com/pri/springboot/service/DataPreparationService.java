package com.pri.springboot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.pri.springboot.dto.JiraQueryRequest;
import com.pri.springboot.entity.TrainingIssue;
import com.pri.springboot.repository.TrainingIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DataPreparationService {

    private final JiraClientService jiraClientService;
    private final TrainingIssueRepository trainingIssueRepository; // <-- NIEUW
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public DataPreparationService(JiraClientService jiraClientService, TrainingIssueRepository trainingIssueRepository) {
        this.jiraClientService = jiraClientService;
        this.trainingIssueRepository = trainingIssueRepository; // <-- NIEUW
    }

    public int prepareAndSaveData(JiraQueryRequest request) throws Exception {
        if (request.getSelectedKeys() == null || request.getSelectedKeys().isEmpty()) {
            return 0;
        }

        String jql = "key in (" + String.join(",", request.getSelectedKeys()) + ")";
        String rawJsonResponse = jiraClientService.fetchIssues(request, jql);
        JsonNode rootNode = objectMapper.readTree(rawJsonResponse);
        ArrayNode issuesNode = (ArrayNode) rootNode.get("issues");


        trainingIssueRepository.deleteAll();

        for (JsonNode issueNode : issuesNode) {
            TrainingIssue trainingIssue = new TrainingIssue();
            trainingIssue.setIssueKey(issueNode.get("key").asText());
            trainingIssue.setSummary(issueNode.at("/fields/summary").asText());
            trainingIssue.setDescription(issueNode.at("/fields/description").asText());

            // Pas de custom field ID aan voor jouw story points
            JsonNode spNode = issueNode.at("/fields/customfield_10035");
            if (spNode != null && !spNode.isNull()) {
                trainingIssue.setStoryPoints(spNode.asDouble());
            }

            JsonNode tsNode = issueNode.at("/fields/timespent");
            if (tsNode != null && !tsNode.isNull()) {
                trainingIssue.setTimeSpentHours(tsNode.asDouble() / 3600.0);
            }

            // Sla het issue op in de database
            trainingIssueRepository.save(trainingIssue);
        }

        System.out.println(issuesNode.size() + " issues succesvol opgeslagen in de database.");
        return issuesNode.size();
    }
}