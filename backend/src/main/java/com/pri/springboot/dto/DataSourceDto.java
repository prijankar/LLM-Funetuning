package com.pri.springboot.dto;

import lombok.Data;
import java.util.Date;

@Data
public class DataSourceDto {
    private Long id;
    private String name;
    private String type;
    private String connectionDetails; // We send this as a JSON string
    private String status;
    private Date createdAt;
    private String url;
    private String projectKey;
}