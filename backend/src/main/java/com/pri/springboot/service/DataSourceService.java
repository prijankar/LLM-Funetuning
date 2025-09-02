package com.pri.springboot.service;

import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import java.util.List;

public interface DataSourceService {
    List<DataSourceDto> getAllDataSources();
    DataSourceDto createDataSource(CreateDataSourceRequest request);
}