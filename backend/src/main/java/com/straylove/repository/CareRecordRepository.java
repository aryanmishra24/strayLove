package com.straylove.repository;

import com.straylove.entity.CareRecord;
import com.straylove.entity.CareRecord.CareType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CareRecordRepository extends JpaRepository<CareRecord, Long> {
    
    // Find all care records for a specific animal
    Page<CareRecord> findByAnimalIdOrderByCareDateDesc(Long animalId, Pageable pageable);
    
    // Find all care records performed by a specific volunteer
    Page<CareRecord> findByPerformedByIdOrderByCareDateDesc(Long volunteerId, Pageable pageable);
    
    // Find care records by date range
    List<CareRecord> findByCareDateBetween(LocalDate start, LocalDate end);
    
    // Find care records by care type and date range
    List<CareRecord> findByCareTypeAndCareDateBetween(CareType careType, LocalDate start, LocalDate end);
    
    // Find care records by animal and care type
    Page<CareRecord> findByAnimalIdAndCareTypeOrderByCareDateDesc(Long animalId, CareType careType, Pageable pageable);
    
    // Find recent care records for dashboard
    @Query("SELECT cr FROM CareRecord cr ORDER BY cr.careDate DESC, cr.createdAt DESC")
    List<CareRecord> findRecentCareRecords(Pageable pageable);
    
    // Count care records by animal
    long countByAnimalId(Long animalId);
    
    // Count care records by volunteer
    long countByPerformedById(Long volunteerId);
    
    // Find care records by animal and volunteer
    Page<CareRecord> findByAnimalIdAndPerformedByIdOrderByCareDateDesc(Long animalId, Long volunteerId, Pageable pageable);
} 