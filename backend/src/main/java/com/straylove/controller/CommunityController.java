package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.community.CommunityLogRequest;
import com.straylove.dto.community.CommunityLogResponse;
import com.straylove.entity.CommunityLog;
import com.straylove.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Community", description = "Community engagement APIs")
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/api/v1/community/logs")
    @Operation(summary = "Get all community logs", description = "Get all community logs across all animals")
    public ResponseEntity<ApiResponse<Page<CommunityLogResponse>>> getAllCommunityLogs(
            @Parameter(description = "Log type filter") @RequestParam(required = false) CommunityLog.LogType type,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        ApiResponse<Page<CommunityLogResponse>> response = communityService.getAllCommunityLogs(type, page, size);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/api/v1/animals/{animalId}/community/logs")
    @Operation(summary = "Add community log", description = "Add a community log for an animal")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CommunityLogResponse>> addCommunityLog(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Valid @RequestBody CommunityLogRequest request) {
        
        ApiResponse<CommunityLogResponse> response = communityService.addCommunityLog(animalId, request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/api/v1/animals/{animalId}/community/logs/{logId}/upvote")
    @Operation(summary = "Upvote log", description = "Upvote a community log")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CommunityLogResponse>> upvoteLog(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Parameter(description = "Log ID") @PathVariable Long logId) {
        
        ApiResponse<CommunityLogResponse> response = communityService.upvoteLog(animalId, logId);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/api/v1/animals/{animalId}/community/logs")
    @Operation(summary = "Get community logs", description = "Get community logs for an animal with optional filtering")
    public ResponseEntity<ApiResponse<Page<CommunityLogResponse>>> getCommunityLogs(
            @Parameter(description = "Animal ID") @PathVariable Long animalId,
            @Parameter(description = "Log type filter") @RequestParam(required = false) CommunityLog.LogType type,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        ApiResponse<Page<CommunityLogResponse>> response = communityService.getCommunityLogsForAnimal(animalId, type, page, size);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/api/v1/community/logs/recent")
    @Operation(summary = "Get recent community logs", description = "Get recent community logs for dashboard")
    public ResponseEntity<ApiResponse<List<CommunityLogResponse>>> getRecentLogs(
            @Parameter(description = "Number of logs to retrieve") @RequestParam(defaultValue = "5") int limit) {
        
        ApiResponse<List<CommunityLogResponse>> response = communityService.getRecentLogs(limit);
        return ResponseEntity.status(response.getCode()).body(response);
    }
} 