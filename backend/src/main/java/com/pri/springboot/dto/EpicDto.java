package com.pri.springboot.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class EpicDto {
    private String epicKey;
    private String epicName;
    private List<IssueDto> issues = new ArrayList<>();
}