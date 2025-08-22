package com.pri.springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "training_issues")
public class TrainingIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String issueKey;

    @Column(columnDefinition = "TEXT") // Voor lange teksten
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double storyPoints;
    private Double timeSpentHours;



    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getIssueKey() {
        return issueKey;
    }
    public void setIssueKey(String issueKey) {
        this.issueKey = issueKey;
    }
    public String getSummary() {
        return summary;
    }
    public void setSummary(String summary) {
        this.summary = summary;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Double getStoryPoints() {
        return storyPoints;
    }
    public void setStoryPoints(Double storyPoints) {
        this.storyPoints = storyPoints;
    }
    public Double getTimeSpentHours() {
        return timeSpentHours;
    }
    public void setTimeSpentHours(Double timeSpentHours) {
        this.timeSpentHours = timeSpentHours;
    }
}