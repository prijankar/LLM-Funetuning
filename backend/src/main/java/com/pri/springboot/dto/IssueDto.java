package com.pri.springboot.dto;

import lombok.Data;

@Data
public class IssueDto {
    private String key;
    private String summary;
    private String type;
    private String status;
}