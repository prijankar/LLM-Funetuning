package com.pri.springboot.dto;

import lombok.Data;
import java.util.List;

@Data
public class JiraQueryFilterDto {
    private String status;
    private List<String> issueTypes;
    // You can add more fields later, like labels, assignees, etc.
}