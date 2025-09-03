package com.pri.springboot.controller;

import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import com.pri.springboot.dto.TestJiraConnectionRequest;
import com.pri.springboot.service.DataSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataSource(@PathVariable Long id) {
        dataSourceService.deleteDataSource(id); // We will create this method next
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<?> syncDataSource(@PathVariable Long id) {
        try {
            dataSourceService.syncDataSource(id);
            return ResponseEntity.ok(Map.of("message", "Data source synced successfully."));
        } catch (Exception e) {
            // It's good practice to log the error on the backend
            // log.error("Sync failed for data source {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to sync data source: " + e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<DataSourceDto> updateDataSource(@PathVariable Long id, @RequestBody CreateDataSourceRequest request) {
        DataSourceDto updatedDataSource = dataSourceService.updateDataSource(id, request);
        return ResponseEntity.ok(updatedDataSource);
    }
    @PostMapping("/test-connection")
    public ResponseEntity<?> testConnection(@RequestBody TestJiraConnectionRequest request) {
        boolean isSuccess = dataSourceService.testJiraConnection(request);
        if (isSuccess) {
            return ResponseEntity.ok(Map.of("message", "Connection successful!"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Connection failed. Please check credentials."));
        }
    }
    @PostMapping("/{id}/test-connection")
    public ResponseEntity<?> testSavedConnection(@PathVariable Long id) {
        boolean isSuccess = dataSourceService.testSavedConnection(id);
        if (isSuccess) {
            return ResponseEntity.ok(Map.of("message", "Connection successful!"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Connection failed. Please check credentials."));
        }

    }
}
