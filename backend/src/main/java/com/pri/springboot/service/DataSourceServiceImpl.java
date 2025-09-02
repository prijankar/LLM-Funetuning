package com.pri.springboot.service;

import com.pri.springboot.dto.CreateDataSourceRequest;
import com.pri.springboot.dto.DataSourceDto;
import com.pri.springboot.entity.DataSource;
import com.pri.springboot.repository.DataSourceRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataSourceServiceImpl implements DataSourceService {

    private final DataSourceRepository dataSourceRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<DataSourceDto> getAllDataSources() {
        return dataSourceRepository.findAll().stream()
                .map(dataSource -> modelMapper.map(dataSource, DataSourceDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public DataSourceDto createDataSource(CreateDataSourceRequest request) {
        DataSource dataSource = new DataSource();
        dataSource.setName(request.getName());
        dataSource.setType(request.getType());
        dataSource.setConnectionDetails(request.getConnectionDetails());
        dataSource.setStatus("NOT_CONNECTED"); // Default status

        DataSource savedDataSource = dataSourceRepository.save(dataSource);

        return modelMapper.map(savedDataSource, DataSourceDto.class);
    }
}