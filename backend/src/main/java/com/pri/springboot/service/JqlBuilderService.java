package com.pri.springboot.service;

import com.pri.springboot.dto.JiraQueryRequest;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class JqlBuilderService {

    public String buildJql(JiraQueryRequest request) {
        StringBuilder jql = new StringBuilder();

        // 1. Project Key
        if (request.getProjectKey() != null && !request.getProjectKey().isEmpty()) {
            jql.append("project = ").append(request.getProjectKey());
        }

        // 2. Statuses
        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
            if (!jql.isEmpty()) jql.append(" AND ");
            String statusesString = request.getStatuses().stream()
                    .map(s -> "\"" + s + "\"")
                    .collect(Collectors.joining(", "));
            jql.append("status IN (").append(statusesString).append(")");
        }

        // Hier kunnen we later meer dynamische filters toevoegen

        System.out.println("Gebouwde JQL: " + jql.toString());
        return jql.toString();
    }
}