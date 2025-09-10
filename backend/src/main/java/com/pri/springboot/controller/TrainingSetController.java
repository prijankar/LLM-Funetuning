package com.pri.springboot.controller;

import com.pri.springboot.dto.CreateTrainingSetRequest;
import com.pri.springboot.service.TrainingSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/training-sets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TrainingSetController {

    private final TrainingSetService trainingSetService;

    @PostMapping
    public ResponseEntity<?> createTrainingSet(@RequestBody CreateTrainingSetRequest request) {
        try {
            trainingSetService.createTrainingSet(request);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}