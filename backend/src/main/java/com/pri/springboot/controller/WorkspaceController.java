package com.pri.springboot.controller;

import com.pri.springboot.dto.ImportedDataDto;
import com.pri.springboot.dto.JiraProjectMetadataDto;
import com.pri.springboot.dto.JiraQueryFilterDto;
import com.pri.springboot.dto.SyncedProjectDto;
import com.pri.springboot.service.WorkspaceService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/projects")
    public ResponseEntity<List<SyncedProjectDto>> getSyncedProjects() {
        return ResponseEntity.ok(workspaceService.getSyncedProjects());
    }

    // This is the single, correct version of this method.
    // It correctly returns a List of DTOs, not Entities.
    @GetMapping("/imported-data/{dataSourceId}")
    public ResponseEntity<List<ImportedDataDto>> getImportedData(@PathVariable Long dataSourceId) {
        return ResponseEntity.ok(workspaceService.getImportedData(dataSourceId));
    }

    @PostMapping("/query/{dataSourceId}")
    public ResponseEntity<List<JsonNode>> queryJiraIssues(
            @PathVariable Long dataSourceId,
            @RequestBody JiraQueryFilterDto filters) throws Exception {
        return ResponseEntity.ok(workspaceService.queryJiraIssues(dataSourceId, filters));
    }

    @GetMapping("/metadata/{dataSourceId}")
    public ResponseEntity<JiraProjectMetadataDto> getJiraMetadata(@PathVariable Long dataSourceId) throws Exception {
        return ResponseEntity.ok(workspaceService.getJiraMetadata(dataSourceId));
    }
}