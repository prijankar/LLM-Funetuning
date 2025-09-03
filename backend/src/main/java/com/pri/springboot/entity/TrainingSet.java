package com.pri.springboot.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "training_sets")
@Getter
@Setter
public class TrainingSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_source_id", nullable = false)
    private DataSource dataSource;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "training_set_items",
            joinColumns = @JoinColumn(name = "training_set_id"),
            inverseJoinColumns = @JoinColumn(name = "imported_data_id")
    )
    private Set<ImportedData> items = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }
}