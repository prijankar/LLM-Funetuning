package com.pri.springboot.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class SprintViewDto {
    private String sprintName; // We can add sprint details later
    private List<EpicDto> epics = new ArrayList<>();
    private List<IssueDto> issuesWithoutEpic = new ArrayList<>();
}