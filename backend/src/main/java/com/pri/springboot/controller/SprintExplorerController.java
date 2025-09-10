package com.pri.springboot.controller;

import com.pri.springboot.dto.SprintViewDto;
import com.pri.springboot.service.SprintExplorerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprint-explorer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SprintExplorerController {

    private final SprintExplorerService sprintExplorerService;

    @GetMapping("/{dataSourceId}")
    public ResponseEntity<SprintViewDto> getSprintView(
            @PathVariable Long dataSourceId,
            @RequestParam String sprintName) throws Exception {
        return ResponseEntity.ok(sprintExplorerService.getSprintView(dataSourceId, sprintName));
    }
    @GetMapping("/{dataSourceId}/sprints")
    public ResponseEntity<List<String>> getSprintsForProject(@PathVariable Long dataSourceId) throws Exception {
        return ResponseEntity.ok(sprintExplorerService.getSprints(dataSourceId));
    }
}