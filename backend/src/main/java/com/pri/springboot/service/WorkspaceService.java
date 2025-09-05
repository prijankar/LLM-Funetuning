package com.pri.springboot.service;

import com.pri.springboot.dto.ImportedDataDto;
import com.pri.springboot.dto.JiraProjectMetadataDto;
import com.pri.springboot.dto.SyncedProjectDto;

import java.util.List;
import com.pri.springboot.dto.JiraQueryFilterDto;
import com.fasterxml.jackson.databind.JsonNode;

public interface WorkspaceService {
    List<SyncedProjectDto> getSyncedProjects();

    List<JsonNode> queryJiraIssues(Long dataSourceId, JiraQueryFilterDto filters) throws Exception;
    JiraProjectMetadataDto getJiraMetadata(Long dataSourceId) throws Exception;
    List<ImportedDataDto> getImportedData(Long dataSourceId);
}