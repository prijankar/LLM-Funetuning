package com.pri.springboot.dto;

import lombok.Data;

@Data
public class TestJiraConnectionRequest {
    private String url;
    private String email;
    private String token;
    private String projectKey;
}