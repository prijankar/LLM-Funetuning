package com.pri.springboot.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTrainingSetRequest {
    private String name;
    private Long dataSourceId;
    private List<Long> importedDataIds;
}