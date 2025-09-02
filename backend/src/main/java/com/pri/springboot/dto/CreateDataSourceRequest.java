package com.pri.springboot.dto;

import lombok.Data;

@Data
public class CreateDataSourceRequest {
    private String name;
    private String type;
    private String connectionDetails; // Frontend will send a stringified JSON
}