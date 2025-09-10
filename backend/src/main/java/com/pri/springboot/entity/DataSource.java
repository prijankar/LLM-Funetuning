package com.pri.springboot.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "data_sources")
@Getter
@Setter
@NoArgsConstructor
public class DataSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g., "JIRA", "DATABASE", "FILE_UPLOAD"


// This tells Hibernate to treat it as a regular, long text string.
// PostgreSQL will correctly store this string in the JSONB column.
    @Column(name = "connection_details", columnDefinition = "TEXT")
    private String connectionDetails;

    @OneToMany(mappedBy = "dataSource", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ImportedData> importedData = new HashSet<>();

    private String status;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}