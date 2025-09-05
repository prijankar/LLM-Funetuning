package com.pri.springboot.dto;

import lombok.Data;
import java.util.List;

@Data
public class JiraProjectMetadataDto {
    private List<String> issueTypes;
    private List<String> statuses;
    // You can add more lists here later, like labels or custom fields
}