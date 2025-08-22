package com.pri.springboot.controller;

import com.pri.springboot.dto.FineTuneRequest;
import com.pri.springboot.service.FineTuneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finetune")
public class FineTuneController {

    private final FineTuneService fineTuneService;

    @Autowired
    public FineTuneController(FineTuneService fineTuneService) {
        this.fineTuneService = fineTuneService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startFineTuning(@RequestBody FineTuneRequest fineTuneRequest) {
        System.out.println("Ontvangen verzoek om training te starten voor model: " + fineTuneRequest.getModelId());
        fineTuneService.startTrainingJob(fineTuneRequest);
        return ResponseEntity.ok("{\"message\": \"Fine-tuning proces is succesvol gestart! Bekijk de backend console voor de voortgang.\"}");
    }
}