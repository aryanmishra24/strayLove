package com.straylove.service;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.community.CommunityLogRequest;
import com.straylove.dto.community.CommunityLogResponse;
import com.straylove.entity.Animal;
import com.straylove.entity.CommunityLog;
import com.straylove.entity.User;
import com.straylove.mapper.CommunityLogMapper;
import com.straylove.repository.AnimalRepository;
import com.straylove.repository.CommunityLogRepository;
import com.straylove.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunityService {

    private final CommunityLogRepository communityLogRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final CommunityLogMapper communityLogMapper;

    public ApiResponse<Page<CommunityLogResponse>> getAllCommunityLogs(
            CommunityLog.LogType logType, 
            int page, 
            int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CommunityLog> logsPage = communityLogRepository.findAllWithOptionalTypeFilter(logType, pageable);
            
            Page<CommunityLogResponse> responsePage = logsPage.map(log -> {
                CommunityLogResponse response = communityLogMapper.toResponse(log);
                response.setIsUpvotedByCurrentUser(false); // TODO: Implement upvote tracking
                return response;
            });

            return ApiResponse.success("Community logs retrieved successfully", responsePage);
        } catch (Exception e) {
            log.error("Error retrieving community logs", e);
            return ApiResponse.error(500, "Failed to retrieve community logs");
        }
    }

    public ApiResponse<Page<CommunityLogResponse>> getCommunityLogsForAnimal(
            Long animalId, 
            CommunityLog.LogType logType, 
            int page, 
            int size) {
        try {
            if (!animalRepository.existsById(animalId)) {
                return ApiResponse.error(404, "Animal not found");
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CommunityLog> logsPage;
            
            if (logType != null) {
                logsPage = communityLogRepository.findByAnimalIdAndLogTypeOrderByCreatedAtDesc(animalId, logType, pageable);
            } else {
                logsPage = communityLogRepository.findByAnimalIdOrderByCreatedAtDesc(animalId, pageable);
            }

            Page<CommunityLogResponse> responsePage = logsPage.map(log -> {
                CommunityLogResponse response = communityLogMapper.toResponse(log);
                response.setIsUpvotedByCurrentUser(false); // TODO: Implement upvote tracking
                return response;
            });

            return ApiResponse.success("Community logs retrieved successfully", responsePage);
        } catch (Exception e) {
            log.error("Error retrieving community logs for animal", e);
            return ApiResponse.error(500, "Failed to retrieve community logs");
        }
    }

    @Transactional
    public ApiResponse<CommunityLogResponse> addCommunityLog(Long animalId, CommunityLogRequest request) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify animal exists
            Animal animal = animalRepository.findById(animalId)
                    .orElseThrow(() -> new RuntimeException("Animal not found"));

            // Create community log
            CommunityLog communityLog = communityLogMapper.toEntity(request);
            communityLog.setAnimal(animal);
            communityLog.setLoggedBy(currentUser);

            CommunityLog savedLog = communityLogRepository.save(communityLog);
            CommunityLogResponse response = communityLogMapper.toResponse(savedLog);
            response.setIsUpvotedByCurrentUser(false);

            log.info("Community log added for animal {} by user {}", animalId, userEmail);
            return ApiResponse.success("Community log added successfully", response);
        } catch (Exception e) {
            log.error("Error adding community log", e);
            return ApiResponse.error(500, "Failed to add community log");
        }
    }

    @Transactional
    public ApiResponse<CommunityLogResponse> upvoteLog(Long animalId, Long logId) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify log exists and belongs to the animal
            CommunityLog communityLog = communityLogRepository.findById(logId)
                    .orElseThrow(() -> new RuntimeException("Community log not found"));

            if (!communityLog.getAnimal().getId().equals(animalId)) {
                return ApiResponse.error(400, "Log does not belong to the specified animal");
            }

            // Increment upvote count
            communityLog.setUpvoteCount(communityLog.getUpvoteCount() + 1);
            CommunityLog savedLog = communityLogRepository.save(communityLog);

            CommunityLogResponse response = communityLogMapper.toResponse(savedLog);
            response.setIsUpvotedByCurrentUser(true); // TODO: Track individual user upvotes

            log.info("Community log upvoted: logId={}, by user={}", logId, userEmail);
            return ApiResponse.success("Log upvoted successfully", response);
        } catch (Exception e) {
            log.error("Error upvoting community log", e);
            return ApiResponse.error(500, "Failed to upvote log");
        }
    }

    public ApiResponse<List<CommunityLogResponse>> getRecentLogs(int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<CommunityLog> recentLogs = communityLogRepository.findRecentLogs(pageable);

            List<CommunityLogResponse> responses = recentLogs.stream()
                    .map(log -> {
                        CommunityLogResponse response = communityLogMapper.toResponse(log);
                        response.setIsUpvotedByCurrentUser(false); // TODO: Implement upvote tracking
                        return response;
                    })
                    .collect(Collectors.toList());

            return ApiResponse.success("Recent community logs retrieved successfully", responses);
        } catch (Exception e) {
            log.error("Error retrieving recent community logs", e);
            return ApiResponse.error(500, "Failed to retrieve recent community logs");
        }
    }
} 