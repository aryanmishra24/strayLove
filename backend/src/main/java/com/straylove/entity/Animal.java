package com.straylove.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "animals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String uniqueIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnimalSpecies species;

    @Column(length = 100)
    private String breed;

    @Column(length = 50)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Temperament temperament;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HealthStatus healthStatus;

    @Column(nullable = false)
    @Builder.Default
    private boolean isVaccinated = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isSterilized = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnimalLocation> locations;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CareRecord> careRecords;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FeedingLog> feedingLogs;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CommunityLog> communityLogs;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnimalImage> images;

    public enum AnimalSpecies {
        DOG, CAT, BIRD, OTHER
    }

    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }

    public enum Temperament {
        FRIENDLY, SHY, AGGRESSIVE, NEUTRAL, PLAYFUL, CALM
    }

    public enum HealthStatus {
        HEALTHY, INJURED, SICK, RECOVERING, CRITICAL
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
} 