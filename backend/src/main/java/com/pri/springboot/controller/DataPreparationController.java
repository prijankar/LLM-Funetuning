package com.pri.springboot.controller;

import com.pri.springboot.dto.JiraQueryRequest;
import com.pri.springboot.service.DataPreparationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data")
public class DataPreparationController {

    private final DataPreparationService dataPreparationService;

    @Autowired
    public DataPreparationController(DataPreparationService dataPreparationService) {
        this.dataPreparationService = dataPreparationService;
    }

    @PostMapping("/prepare")
    public ResponseEntity<?> prepareData(@RequestBody JiraQueryRequest request) {
        try {
            // Roep de service aan met de lijst van geselecteerde keys en de request (voor credentials)
            int count = dataPreparationService.prepareAndSaveData(request);
            String message = String.format("%d issue(s) succesvol voorbereid en opgeslagen.", count);
            return ResponseEntity.ok("{\"message\": \"" + message + "\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Data voorbereiden is mislukt: " + e.getMessage() + "\"}");
        }
    }
}