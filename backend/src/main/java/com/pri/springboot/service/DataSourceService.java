package com.pri.springboot.service;

import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import com.pri.springboot.dto.TestJiraConnectionRequest;

import java.util.List;

public interface DataSourceService {
    List<DataSourceDto> getAllDataSources();
    DataSourceDto createDataSource(CreateDataSourceRequest request);

    void deleteDataSource(Long id);

    void syncDataSource(Long id) throws Exception;

    DataSourceDto updateDataSource(Long id, CreateDataSourceRequest request);

    boolean testJiraConnection(TestJiraConnectionRequest request);
    boolean testSavedConnection(Long id);
}
