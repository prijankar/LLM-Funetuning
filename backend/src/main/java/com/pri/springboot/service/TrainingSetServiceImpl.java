package com.pri.springboot.service;

import com.pri.springboot.dto.CreateTrainingSetRequest;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.entity.ImportedData;
import com.pri.springboot.entity.TrainingSet;
import com.pri.springboot.repository.DataSourceRepository;
import com.pri.springboot.repository.ImportedDataRepository;
import com.pri.springboot.repository.TrainingSetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingSetServiceImpl implements TrainingSetService {

    private final TrainingSetRepository trainingSetRepository;
    private final DataSourceRepository dataSourceRepository;
    private final ImportedDataRepository importedDataRepository;

    @Override
    @Transactional
    public TrainingSet createTrainingSet(CreateTrainingSetRequest request) {
        // 1. Find the parent DataSource
        DataSource dataSource = dataSourceRepository.findById(request.getDataSourceId())
                .orElseThrow(() -> new RuntimeException("DataSource not found"));

        // 2. Find all the selected ImportedData entities
        List<ImportedData> itemsToInclude = importedDataRepository.findAllById(request.getImportedDataIds());

        // 3. Create and save the new TrainingSet
        TrainingSet newTrainingSet = new TrainingSet();
        newTrainingSet.setName(request.getName());
        newTrainingSet.setDataSource(dataSource);
        newTrainingSet.setItems(new HashSet<>(itemsToInclude));

        return trainingSetRepository.save(newTrainingSet);
    }
}