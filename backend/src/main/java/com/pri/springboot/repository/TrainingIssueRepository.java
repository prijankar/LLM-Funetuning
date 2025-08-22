package com.pri.springboot.repository;

import com.pri.springboot.entity.TrainingIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingIssueRepository extends JpaRepository<TrainingIssue, Long> {
    void deleteAll();
    // Spring Data JPA genereert automatisch alle standaard database-operaties
}