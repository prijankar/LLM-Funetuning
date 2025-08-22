package com.pri.springboot.dto;

public class FineTuneRequest {
    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public int getLoraAlpha() {
        return loraAlpha;
    }

    public void setLoraAlpha(int loraAlpha) {
        this.loraAlpha = loraAlpha;
    }

    public int getLoraR() {
        return loraR;
    }

    public void setLoraR(int loraR) {
        this.loraR = loraR;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public double getLearningRate() {
        return learningRate;
    }

    public void setLearningRate(double learningRate) {
        this.learningRate = learningRate;
    }

    public int getEpochs() {
        return epochs;
    }

    public void setEpochs(int epochs) {
        this.epochs = epochs;
    }

    private String modelId;
    private int epochs;
    private double learningRate;
    private int batchSize;
    private int loraR;
    private int loraAlpha;

    // Voeg getters en setters toe voor alle velden
}