package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.donation.CreateCampaignRequest;
import com.straylove.dto.donation.DonationRequest;
import com.straylove.dto.donation.DonationResponse;
import com.straylove.dto.donation.CampaignResponse;
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
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Donation management APIs")
public class DonationController {

    // TODO: Inject DonationService when created
    // private final DonationService donationService;

    @GetMapping("/campaigns")
    @Operation(summary = "List active campaigns", description = "Get all active donation campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getActiveCampaigns() {
        
        // TODO: Implement active campaigns retrieval logic
        return ResponseEntity.ok(ApiResponse.success("Active campaigns retrieved successfully", null));
    }

    @PostMapping("/campaigns")
    @Operation(summary = "Create campaign", description = "Create a new donation campaign (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(
            @Valid @RequestBody CreateCampaignRequest request) {
        
        // TODO: Implement campaign creation logic
        return ResponseEntity.ok(ApiResponse.success("Campaign created successfully", null));
    }

    @PostMapping("/donate")
    @Operation(summary = "Make donation", description = "Make a donation to a campaign")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DonationResponse>> makeDonation(
            @Valid @RequestBody DonationRequest request) {
        
        // TODO: Implement donation logic
        return ResponseEntity.ok(ApiResponse.success("Donation made successfully", null));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user donations", description = "Get all donations made by a user")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<DonationResponse>>> getUserDonations(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // TODO: Implement user donations retrieval logic
        return ResponseEntity.ok(ApiResponse.success("User donations retrieved successfully", null));
    }
} 