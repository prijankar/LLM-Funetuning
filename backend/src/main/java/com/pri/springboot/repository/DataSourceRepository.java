package com.pri.springboot.repository;

import com.pri.springboot.entity.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, Long> {
    // Spring Data JPA automatically provides methods like findAll(), findById(), save(), etc.
}