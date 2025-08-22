package com.pri.springboot.service;

import com.pri.springboot.dto.JiraQueryRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class JiraClientService {

    // DEZE METHODE HEEFT NU DE CORRECTE ARGUMENTEN
    public String fetchIssues(JiraQueryRequest request, String jql) {
        RestTemplate restTemplate = new RestTemplate();
        String fieldsToFetch = String.join(",", request.getFieldsToReturn());

        String url = UriComponentsBuilder.fromHttpUrl(request.getUrl())
                .path("/rest/api/2/search")
                .queryParam("jql", jql)
                .queryParam("fields", fieldsToFetch)
                .build()
                .toUriString();

        System.out.println("Request URL naar Jira: " + url);

        // Gebruik de credentials van het nieuwe request-object
        String auth = request.getEmail() + ":" + request.getToken();
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        String authHeader = "Basic " + new String(encodedAuth);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Accept", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        return response.getBody();
    }
}