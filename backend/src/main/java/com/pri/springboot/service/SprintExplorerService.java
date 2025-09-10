package com.pri.springboot.service;

import com.pri.springboot.dto.SprintViewDto;

import java.util.List;

public interface SprintExplorerService {
    SprintViewDto getSprintView(Long dataSourceId, String sprintName) throws Exception;
    List<String> getSprints(Long dataSourceId) throws Exception;
}