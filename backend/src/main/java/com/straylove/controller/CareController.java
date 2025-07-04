package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.care.CareRecordRequest;
import com.straylove.dto.care.CareRecordResponse;
import com.straylove.dto.care.FeedingLogRequest;
import com.straylove.dto.care.FeedingLogResponse;
import com.straylove.service.CareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Care Management", description = "Animal care management APIs")
@Slf4j
public class CareController {

    private final CareService careService;

    @GetMapping("/api/v1/care/records")
    @Operation(summary = "Get all care records", description = "Get all care records across all animals")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<Page<CareRecordResponse>>> getAllCareRecords(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "careDate"));
            Page<CareRecordResponse> careRecords = careService.getAllCareRecords(pageable);
            return ResponseEntity.ok(ApiResponse.success("Care records retrieved successfully", careRecords));
        } catch (Exception e) {
            log.error("Error retrieving care records", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve care records: " + e.getMessage()));
        }
    }

    @PostMapping("/api/v1/animals/{animalId}/care/records")
    @Operation(summary = "Record care", description = "Record care activities for an animal (Volunteer/Admin)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CareRecordResponse>> recordCare(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Valid @RequestBody CareRecordRequest request) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            CareRecordResponse careRecord = careService.createCareRecord(animalId, request, userEmail);
            return ResponseEntity.ok(ApiResponse.success("Care recorded successfully", careRecord));
        } catch (Exception e) {
            log.error("Error recording care for animal {}", animalId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to record care: " + e.getMessage()));
        }
    }

    @PostMapping("/api/v1/animals/{animalId}/care/feeding")
    @Operation(summary = "Log feeding", description = "Log feeding activity for an animal (Auth required)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedingLogResponse>> logFeeding(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Valid @RequestBody FeedingLogRequest request) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            FeedingLogResponse feedingLog = careService.createFeedingLog(animalId, request, userEmail);
            return ResponseEntity.ok(ApiResponse.success("Feeding logged successfully", feedingLog));
        } catch (Exception e) {
            log.error("Error logging feeding for animal {}", animalId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to log feeding: " + e.getMessage()));
        }
    }

    @GetMapping("/api/v1/animals/{animalId}/care/history")
    @Operation(summary = "Get care history", description = "Get care history for an animal")
    public ResponseEntity<ApiResponse<Page<CareRecordResponse>>> getCareHistory(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "careDate"));
            Page<CareRecordResponse> careHistory = careService.getCareRecordsByAnimal(animalId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Care history retrieved successfully", careHistory));
        } catch (Exception e) {
            log.error("Error retrieving care history for animal {}", animalId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve care history: " + e.getMessage()));
        }
    }

    @GetMapping("/api/v1/animals/{animalId}/care/feeding/schedule")
    @Operation(summary = "Get feeding schedule", description = "Get feeding schedule for an animal")
    public ResponseEntity<ApiResponse<List<FeedingLogResponse>>> getFeedingSchedule(
            @Parameter(description = "Animal ID") @PathVariable Long animalId) {
        
        try {
            List<FeedingLogResponse> feedingSchedule = careService.getFeedingSchedule(animalId);
            return ResponseEntity.ok(ApiResponse.success("Feeding schedule retrieved successfully", feedingSchedule));
        } catch (Exception e) {
            log.error("Error retrieving feeding schedule for animal {}", animalId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve feeding schedule: " + e.getMessage()));
        }
    }

    @GetMapping("/api/v1/animals/{animalId}/care/feeding")
    @Operation(summary = "Get feeding logs", description = "Get feeding logs for an animal")
    public ResponseEntity<ApiResponse<Page<FeedingLogResponse>>> getFeedingLogs(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "feedingTime"));
            Page<FeedingLogResponse> feedingLogs = careService.getFeedingLogsByAnimal(animalId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Feeding logs retrieved successfully", feedingLogs));
        } catch (Exception e) {
            log.error("Error retrieving feeding logs for animal {}", animalId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve feeding logs: " + e.getMessage()));
        }
    }

    @GetMapping("/api/v1/volunteers/{volunteerId}/care/records")
    @Operation(summary = "Get volunteer care records", description = "Get care records performed by a specific volunteer")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<Page<CareRecordResponse>>> getVolunteerCareRecords(
            @Parameter(description = "Volunteer ID") @PathVariable Long volunteerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "careDate"));
            Page<CareRecordResponse> careRecords = careService.getCareRecordsByVolunteer(volunteerId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Volunteer care records retrieved successfully", careRecords));
        } catch (Exception e) {
            log.error("Error retrieving care records for volunteer {}", volunteerId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve volunteer care records: " + e.getMessage()));
        }
    }

    @GetMapping("/api/v1/care/records/recent")
    @Operation(summary = "Get recent care records", description = "Get recent care records for dashboard")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<CareRecordResponse>>> getRecentCareRecords(
            @Parameter(description = "Number of records to retrieve") @RequestParam(defaultValue = "5") int limit) {
        
        try {
            List<CareRecordResponse> recentCareRecords = careService.getRecentCareRecords(limit);
            return ResponseEntity.ok(ApiResponse.success("Recent care records retrieved successfully", recentCareRecords));
        } catch (Exception e) {
            log.error("Error retrieving recent care records", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Failed to retrieve recent care records: " + e.getMessage()));
        }
    }
} 