package com.straylove.service;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.care.CareRecordRequest;
import com.straylove.dto.care.CareRecordResponse;
import com.straylove.dto.care.FeedingLogRequest;
import com.straylove.dto.care.FeedingLogResponse;
import com.straylove.entity.Animal;
import com.straylove.entity.CareRecord;
import com.straylove.entity.FeedingLog;
import com.straylove.entity.User;
import com.straylove.mapper.StrayLoveMapper;
import com.straylove.repository.AnimalRepository;
import com.straylove.repository.CareRecordRepository;
import com.straylove.repository.FeedingLogRepository;
import com.straylove.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareService {

    private final CareRecordRepository careRecordRepository;
    private final FeedingLogRepository feedingLogRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final StrayLoveMapper mapper;

    // Care Record Methods

    @Transactional
    public CareRecordResponse createCareRecord(Long animalId, CareRecordRequest request, String userEmail) {
        log.info("Creating care record for animal {} by user {}", animalId, userEmail);
        
        // Find animal
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal not found with id: " + animalId));
        
        // Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        // Create care record
        CareRecord careRecord = CareRecord.builder()
                .animal(animal)
                .careType(request.getCareType())
                .careDate(request.getCareDate())
                .description(request.getDescription())
                .performedBy(user)
                .build();
        
        CareRecord savedCareRecord = careRecordRepository.save(careRecord);
        log.info("Care record created successfully with id: {}", savedCareRecord.getId());
        
        return mapper.careRecordToCareRecordResponse(savedCareRecord);
    }

    public Page<CareRecordResponse> getCareRecordsByAnimal(Long animalId, Pageable pageable) {
        log.info("Fetching care records for animal: {}", animalId);
        
        // Verify animal exists
        if (!animalRepository.existsById(animalId)) {
            throw new RuntimeException("Animal not found with id: " + animalId);
        }
        
        Page<CareRecord> careRecords = careRecordRepository.findByAnimalIdOrderByCareDateDesc(animalId, pageable);
        return careRecords.map(mapper::careRecordToCareRecordResponse);
    }

    public Page<CareRecordResponse> getCareRecordsByVolunteer(Long volunteerId, Pageable pageable) {
        log.info("Fetching care records for volunteer: {}", volunteerId);
        
        // Verify user exists
        if (!userRepository.existsById(volunteerId)) {
            throw new RuntimeException("User not found with id: " + volunteerId);
        }
        
        Page<CareRecord> careRecords = careRecordRepository.findByPerformedByIdOrderByCareDateDesc(volunteerId, pageable);
        return careRecords.map(mapper::careRecordToCareRecordResponse);
    }

    public Page<CareRecordResponse> getAllCareRecords(Pageable pageable) {
        log.info("Fetching all care records");
        
        Page<CareRecord> careRecords = careRecordRepository.findAll(pageable);
        return careRecords.map(mapper::careRecordToCareRecordResponse);
    }

    public List<CareRecordResponse> getCareRecordsByDateRange(LocalDate start, LocalDate end) {
        log.info("Fetching care records between {} and {}", start, end);
        
        List<CareRecord> careRecords = careRecordRepository.findByCareDateBetween(start, end);
        return careRecords.stream()
                .map(mapper::careRecordToCareRecordResponse)
                .collect(Collectors.toList());
    }

    public List<CareRecordResponse> getRecentCareRecords(int limit) {
        log.info("Fetching recent care records with limit: {}", limit);
        
        Pageable pageable = Pageable.ofSize(limit);
        List<CareRecord> careRecords = careRecordRepository.findRecentCareRecords(pageable);
        return careRecords.stream()
                .map(mapper::careRecordToCareRecordResponse)
                .collect(Collectors.toList());
    }

    // Feeding Log Methods

    @Transactional
    public FeedingLogResponse createFeedingLog(Long animalId, FeedingLogRequest request, String userEmail) {
        log.info("Creating feeding log for animal {} by user {}", animalId, userEmail);
        
        // Find animal
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal not found with id: " + animalId));
        
        // Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        // Create feeding log
        FeedingLog feedingLog = FeedingLog.builder()
                .animal(animal)
                .fedBy(user)
                .feedingTime(request.getFeedingTime())
                .foodType(request.getFoodType())
                .quantity(request.getQuantity())
                .build();
        
        FeedingLog savedFeedingLog = feedingLogRepository.save(feedingLog);
        log.info("Feeding log created successfully with id: {}", savedFeedingLog.getId());
        
        return mapper.feedingLogToFeedingLogResponse(savedFeedingLog);
    }

    public Page<FeedingLogResponse> getFeedingLogsByAnimal(Long animalId, Pageable pageable) {
        log.info("Fetching feeding logs for animal: {}", animalId);
        
        // Verify animal exists
        if (!animalRepository.existsById(animalId)) {
            throw new RuntimeException("Animal not found with id: " + animalId);
        }
        
        Page<FeedingLog> feedingLogs = feedingLogRepository.findByAnimalIdOrderByFeedingTimeDesc(animalId, pageable);
        return feedingLogs.map(mapper::feedingLogToFeedingLogResponse);
    }

    public List<FeedingLogResponse> getFeedingSchedule(Long animalId) {
        log.info("Fetching feeding schedule for animal: {}", animalId);
        
        // Verify animal exists
        if (!animalRepository.existsById(animalId)) {
            throw new RuntimeException("Animal not found with id: " + animalId);
        }
        
        // Get today's feeding logs
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
        List<FeedingLog> feedingLogs = feedingLogRepository.findTodayFeedingLogsByAnimal(animalId, startOfDay, endOfDay);
        return feedingLogs.stream()
                .map(mapper::feedingLogToFeedingLogResponse)
                .collect(Collectors.toList());
    }

    public List<FeedingLogResponse> getFeedingLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        log.info("Fetching feeding logs between {} and {}", start, end);
        
        List<FeedingLog> feedingLogs = feedingLogRepository.findByFeedingTimeBetween(start, end);
        return feedingLogs.stream()
                .map(mapper::feedingLogToFeedingLogResponse)
                .collect(Collectors.toList());
    }

    public List<FeedingLogResponse> getRecentFeedingLogs(int limit) {
        log.info("Fetching recent feeding logs with limit: {}", limit);
        
        Pageable pageable = Pageable.ofSize(limit);
        List<FeedingLog> feedingLogs = feedingLogRepository.findRecentFeedingLogs(pageable);
        return feedingLogs.stream()
                .map(mapper::feedingLogToFeedingLogResponse)
                .collect(Collectors.toList());
    }

    // Statistics Methods

    public long getCareRecordCountByAnimal(Long animalId) {
        return careRecordRepository.countByAnimalId(animalId);
    }

    public long getCareRecordCountByVolunteer(Long volunteerId) {
        return careRecordRepository.countByPerformedById(volunteerId);
    }

    public long getFeedingLogCountByAnimal(Long animalId) {
        return feedingLogRepository.countByAnimalId(animalId);
    }

    public long getFeedingLogCountByVolunteer(Long volunteerId) {
        return feedingLogRepository.countByFedById(volunteerId);
    }
} 