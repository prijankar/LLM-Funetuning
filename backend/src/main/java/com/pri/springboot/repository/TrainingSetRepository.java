package com.pri.springboot.repository;

import com.pri.springboot.entity.TrainingSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingSetRepository extends JpaRepository<TrainingSet, Long> {
    // Basic CRUD methods are enough for now
}