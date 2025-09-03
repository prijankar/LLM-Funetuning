package com.pri.springboot.repository;

import com.pri.springboot.entity.ImportedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImportedDataRepository extends JpaRepository<ImportedData, Long> {
    // Finds all raw data entries linked to a specific DataSource
    List<ImportedData> findByDataSourceId(Long dataSourceId);
}