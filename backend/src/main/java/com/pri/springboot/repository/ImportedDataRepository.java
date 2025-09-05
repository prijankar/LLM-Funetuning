package com.pri.springboot.repository;

import com.pri.springboot.entity.ImportedData;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImportedDataRepository extends JpaRepository<ImportedData, Long> {
    List<ImportedData> findByDataSourceId(Long dataSourceId);

    // Add this method to delete all entries for a given data source
    @Modifying
    @Transactional
    void deleteByDataSourceId(Long dataSourceId);
}