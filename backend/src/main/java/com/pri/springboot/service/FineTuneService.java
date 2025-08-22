package com.pri.springboot.service;

import com.pri.springboot.dto.FineTuneRequest;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.concurrent.Executors;

@Service
public class FineTuneService {

    public void startTrainingJob(FineTuneRequest request) {
        Executors.newSingleThreadExecutor().submit(() -> {
            try {
                System.out.println("Fine-tuning starten voor model: " + request.getModelId());

                // HET CORRECTE, VOLLEDIGE PAD NAAR DE PYTHON EXECUTABLE IN JE VENV
                String pythonExecutablePath = "C:/Work/FineTuning/ml-training/venv/Scripts/python.exe";

                ProcessBuilder processBuilder = new ProcessBuilder(
                        pythonExecutablePath, // Gebruik het volledige pad ipv alleen "python"
                        "scripts/04_finetune_and_predict.py",
                        "--model_id", request.getModelId(),
                        "--epochs", String.valueOf(request.getEpochs()),
                        "--learning_rate", String.valueOf(request.getLearningRate()),
                        "--batch_size", String.valueOf(request.getBatchSize()),
                        "--lora_r", String.valueOf(request.getLoraR()),
                        "--lora_alpha", String.valueOf(request.getLoraAlpha())
                );

                processBuilder.directory(new File("C:/Work/FineTuning/ml-training/"));
                processBuilder.redirectErrorStream(true);

                Process process = processBuilder.start();

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[Python Script]: " + line);
                    }
                }

                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    System.out.println("✅ Python script succesvol voltooid!");
                } else {
                    throw new RuntimeException("Python script is gefaald met exit code " + exitCode);
                }

            } catch (Exception e) {
                System.err.println("Fout tijdens het uitvoeren van het fine-tuning script: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }}