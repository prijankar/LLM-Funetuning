package com.pri.springboot.service;

import com.pri.springboot.dto.SyncedProjectDto;
import com.pri.springboot.entity.ImportedData;
import java.util.List;
import com.pri.springboot.dto.JiraQueryFilterDto;
import com.fasterxml.jackson.databind.JsonNode;

public interface WorkspaceService {
    List<SyncedProjectDto> getSyncedProjects();
    List<ImportedData> getImportedData(Long dataSourceId);
    List<JsonNode> queryJiraIssues(Long dataSourceId, JiraQueryFilterDto filters) throws Exception;
}