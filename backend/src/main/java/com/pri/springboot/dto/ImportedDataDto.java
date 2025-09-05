package com.pri.springboot.dto;

import lombok.Data;

@Data
public class ImportedDataDto {
    private Long id;
    private Long dataSourceId;
    private String rawContent;
}