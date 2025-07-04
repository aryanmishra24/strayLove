package com.straylove.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CommunityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logged_by", nullable = false)
    private User loggedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogType logType;

    @Column(length = 1000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgencyLevel;

    @Builder.Default
    @Column(nullable = false)
    private Integer upvoteCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum LogType {
        SIGHTING,      // Animal was seen
        CONCERN,       // Health or safety concern
        UPDATE,        // Status update
        ALERT,         // Emergency alert
        FEEDING,       // Feeding activity
        CARE,          // Care activity
        ADOPTION,      // Adoption related
        OTHER          // Other activities
    }

    public enum UrgencyLevel {
        LOW,        // General information
        MEDIUM,     // Moderate concern
        HIGH,       // Important update
        CRITICAL    // Emergency situation
    }
} 