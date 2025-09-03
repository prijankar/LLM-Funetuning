package com.pri.springboot.controller;


import com.pri.springboot.entity.ImportedData;
import com.pri.springboot.service.WorkspaceService; // We will create this next
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pri.springboot.dto.SyncedProjectDto;

import java.util.List;
import com.pri.springboot.dto.JiraQueryFilterDto;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/projects")
    // CHANGE the return type here from DataSourceDto to SyncedProjectDto
    public ResponseEntity<List<SyncedProjectDto>> getSyncedProjects() {
        return ResponseEntity.ok(workspaceService.getSyncedProjects());
    }
    @GetMapping("/imported-data/{dataSourceId}")
    public ResponseEntity<List<ImportedData>> getImportedData(@PathVariable Long dataSourceId) {
        return ResponseEntity.ok(workspaceService.getImportedData(dataSourceId));
    }
    @PostMapping("/query/{dataSourceId}")
    public ResponseEntity<List<JsonNode>> queryJiraIssues(
            @PathVariable Long dataSourceId,
            @RequestBody JiraQueryFilterDto filters) throws Exception {
        return ResponseEntity.ok(workspaceService.queryJiraIssues(dataSourceId, filters));
    }
}