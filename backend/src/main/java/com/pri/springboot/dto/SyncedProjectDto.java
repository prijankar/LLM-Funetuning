package com.pri.springboot.dto;

import lombok.Data;

@Data
public class SyncedProjectDto {
    private Long id;
    private String name;
    private String type;
    private String status;
}