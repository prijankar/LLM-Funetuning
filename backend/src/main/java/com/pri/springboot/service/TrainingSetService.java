package com.pri.springboot.service;

import com.pri.springboot.dto.CreateTrainingSetRequest;
import com.pri.springboot.entity.TrainingSet;

public interface TrainingSetService {
    TrainingSet createTrainingSet(CreateTrainingSetRequest request);
}