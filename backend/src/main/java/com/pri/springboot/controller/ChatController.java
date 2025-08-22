package com.pri.springboot.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @PostMapping
    public ResponseEntity<String> chatWithModel(@RequestBody String prompt) {
        RestTemplate restTemplate = new RestTemplate();
        String pythonServerUrl = "http://localhost:5001/predict";

        try {
            // Stap 1: Maak een Map object. Dit is een veilige manier om JSON te bouwen.
            Map<String, String> requestBody = Collections.singletonMap("prompt", prompt);

            // Stap 2: Laat RestTemplate de Map automatisch converteren naar JSON
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // Roep onze eigen Python server aan
            String response = restTemplate.postForObject(pythonServerUrl, entity, String.class);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Kon niet communiceren met de Python inference server.\"}");
        }
    }
}