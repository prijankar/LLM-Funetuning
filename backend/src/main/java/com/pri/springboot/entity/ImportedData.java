package com.pri.springboot.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "imported_data")
@Getter
@Setter
public class ImportedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_source_id", nullable = false)
    private DataSource dataSource;

    @Column(name = "raw_content", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String rawContent; // The full JSON of the Jira issue
}