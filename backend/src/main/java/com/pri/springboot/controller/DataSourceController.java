package com.pri.springboot.controller;

import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import com.pri.springboot.service.DataSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-sources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // For local development
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @GetMapping
    public ResponseEntity<List<DataSourceDto>> getAllDataSources() {
        List<DataSourceDto> dataSources = dataSourceService.getAllDataSources();
        return ResponseEntity.ok(dataSources);
    }

    @PostMapping
    public ResponseEntity<DataSourceDto> createDataSource(@RequestBody CreateDataSourceRequest request) {
        DataSourceDto createdDataSource = dataSourceService.createDataSource(request);
        return new ResponseEntity<>(createdDataSource, HttpStatus.CREATED);
    }
}