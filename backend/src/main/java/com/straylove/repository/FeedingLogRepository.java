package com.straylove.repository;

import com.straylove.entity.FeedingLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedingLogRepository extends JpaRepository<FeedingLog, Long> {
    
    // Find all feeding logs for a specific animal
    Page<FeedingLog> findByAnimalIdOrderByFeedingTimeDesc(Long animalId, Pageable pageable);
    
    // Find all feeding logs by a specific volunteer
    Page<FeedingLog> findByFedByIdOrderByFeedingTimeDesc(Long volunteerId, Pageable pageable);
    
    // Find feeding logs by date range
    List<FeedingLog> findByFeedingTimeBetween(LocalDateTime start, LocalDateTime end);
    
    // Find feeding logs by animal and date range
    List<FeedingLog> findByAnimalIdAndFeedingTimeBetween(Long animalId, LocalDateTime start, LocalDateTime end);
    
    // Find recent feeding logs for dashboard
    @Query("SELECT fl FROM FeedingLog fl ORDER BY fl.feedingTime DESC")
    List<FeedingLog> findRecentFeedingLogs(Pageable pageable);
    
    // Count feeding logs by animal
    long countByAnimalId(Long animalId);
    
    // Count feeding logs by volunteer
    long countByFedById(Long volunteerId);
    
    // Find feeding logs by animal and volunteer
    Page<FeedingLog> findByAnimalIdAndFedByIdOrderByFeedingTimeDesc(Long animalId, Long volunteerId, Pageable pageable);
    
    // Find today's feeding logs for an animal
    @Query("SELECT fl FROM FeedingLog fl WHERE fl.animal.id = :animalId AND fl.feedingTime >= :startOfDay AND fl.feedingTime < :endOfDay ORDER BY fl.feedingTime DESC")
    List<FeedingLog> findTodayFeedingLogsByAnimal(@org.springframework.data.repository.query.Param("animalId") Long animalId, 
                                                   @org.springframework.data.repository.query.Param("startOfDay") LocalDateTime startOfDay,
                                                   @org.springframework.data.repository.query.Param("endOfDay") LocalDateTime endOfDay);
} 