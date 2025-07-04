package com.straylove.repository;

import com.straylove.entity.CommunityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityLogRepository extends JpaRepository<CommunityLog, Long> {

    // Find all logs for a specific animal
    Page<CommunityLog> findByAnimalIdOrderByCreatedAtDesc(Long animalId, Pageable pageable);

    // Find logs by animal and log type
    Page<CommunityLog> findByAnimalIdAndLogTypeOrderByCreatedAtDesc(
        Long animalId, 
        CommunityLog.LogType logType, 
        Pageable pageable
    );

    // Find all logs across all animals with optional type filter
    @Query("SELECT cl FROM CommunityLog cl WHERE " +
           "(:logType IS NULL OR cl.logType = :logType) " +
           "ORDER BY cl.createdAt DESC")
    Page<CommunityLog> findAllWithOptionalTypeFilter(
        @Param("logType") CommunityLog.LogType logType, 
        Pageable pageable
    );

    // Find logs by urgency level
    Page<CommunityLog> findByUrgencyLevelOrderByCreatedAtDesc(
        CommunityLog.UrgencyLevel urgencyLevel, 
        Pageable pageable
    );

    // Find logs by user
    Page<CommunityLog> findByLoggedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find recent logs for dashboard
    @Query("SELECT cl FROM CommunityLog cl ORDER BY cl.createdAt DESC")
    List<CommunityLog> findRecentLogs(Pageable pageable);

    // Count logs by animal
    long countByAnimalId(Long animalId);

    // Count logs by user
    long countByLoggedById(Long userId);

    // Sum upvotes by user
    @Query("SELECT COALESCE(SUM(cl.upvoteCount), 0) FROM CommunityLog cl WHERE cl.loggedBy.id = :userId")
    Long sumUpvotesByLoggedById(@Param("userId") Long userId);
} 