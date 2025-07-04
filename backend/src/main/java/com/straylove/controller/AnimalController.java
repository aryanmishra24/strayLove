package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.animal.AnimalResponse;
import com.straylove.dto.animal.CreateAnimalRequest;
import com.straylove.dto.animal.UserStatsResponse;
import com.straylove.entity.Animal;
import com.straylove.service.AnimalService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/animals")
@RequiredArgsConstructor
@Tag(name = "Animals", description = "Animal management APIs")
public class AnimalController {

    private final AnimalService animalService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Report a new animal", description = "Create a new animal report with images")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnimalResponse>> reportAnimal(
            @RequestParam("species") Animal.AnimalSpecies species,
            @RequestParam("breed") String breed,
            @RequestParam("color") String color,
            @RequestParam("gender") Animal.Gender gender,
            @RequestParam("temperament") Animal.Temperament temperament,
            @RequestParam("healthStatus") Animal.HealthStatus healthStatus,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("address") String address,
            @RequestParam("area") String area,
            @RequestParam("city") String city,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        // Create CreateAnimalRequest from individual parameters
        CreateAnimalRequest request = CreateAnimalRequest.builder()
                .species(species)
                .breed(breed)
                .color(color)
                .gender(gender)
                .temperament(temperament)
                .healthStatus(healthStatus)
                .latitude(latitude)
                .longitude(longitude)
                .address(address)
                .area(area)
                .city(city)
                .build();
        
        ApiResponse<AnimalResponse> response = animalService.reportAnimal(request, images);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping
    @Operation(summary = "Search animals", description = "Search animals with optional filters")
    public ResponseEntity<ApiResponse<Page<AnimalResponse>>> searchAnimals(
            @Parameter(description = "Animal species filter") @RequestParam(required = false) Animal.AnimalSpecies species,
            @Parameter(description = "Area filter") @RequestParam(required = false) String area,
            @Parameter(description = "Approval status filter (ADMIN only)") @RequestParam(required = false) Animal.ApprovalStatus approvalStatus,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication authentication) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Only admins can filter by approvalStatus; others always get APPROVED
        // If approvalStatus is null and user is not admin, default to APPROVED
        Animal.ApprovalStatus effectiveStatus;
        if (isAdmin) {
            effectiveStatus = approvalStatus; // Can be null for admins to see all
        } else {
            effectiveStatus = Animal.ApprovalStatus.APPROVED; // Non-admins always see only approved
        }

        ApiResponse<Page<AnimalResponse>> response = animalService.searchAnimals(species, area, effectiveStatus, pageable);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby animals", description = "Find animals within a specified radius")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> getNearbyAnimals(
            @Parameter(description = "Latitude") @RequestParam Double lat,
            @Parameter(description = "Longitude") @RequestParam Double lon,
            @Parameter(description = "Radius in kilometers") @RequestParam(defaultValue = "5") Double radius) {
        
        ApiResponse<List<AnimalResponse>> response = animalService.getNearbyAnimals(lat, lon, radius);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get animal details", description = "Retrieve a specific animal with all details")
    public ResponseEntity<ApiResponse<AnimalResponse>> getAnimalById(
            @Parameter(description = "Animal ID") @PathVariable Long id) {
        
        ApiResponse<AnimalResponse> response = animalService.getAnimalById(id);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve animal report", description = "Approve a reported animal (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnimalResponse>> approveAnimal(
            @Parameter(description = "Animal ID") @PathVariable Long id) {
        ApiResponse<AnimalResponse> response = animalService.setAnimalApprovalStatus(id, Animal.ApprovalStatus.APPROVED);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject animal report", description = "Reject a reported animal (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnimalResponse>> rejectAnimal(
            @Parameter(description = "Animal ID") @PathVariable Long id) {
        ApiResponse<AnimalResponse> response = animalService.setAnimalApprovalStatus(id, Animal.ApprovalStatus.REJECTED);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/{id}/images")
    @Operation(summary = "Add image to animal", description = "Upload and add an image to an animal")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> addAnimalImage(
            @Parameter(description = "Animal ID") @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "caption", required = false) String caption) {
        
        // TODO: Implement image upload logic
        return ResponseEntity.ok(ApiResponse.success("Image added successfully", null));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update animal", description = "Update an existing animal report")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnimalResponse>> updateAnimal(
            @Parameter(description = "Animal ID") @PathVariable Long id,
            @Valid @RequestBody CreateAnimalRequest request) {
        
        ApiResponse<AnimalResponse> response = animalService.updateAnimal(id, request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/my-reports")
    @Operation(summary = "Get user's animal reports", description = "Get all animals reported by the current user")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AnimalResponse>>> getMyReports(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        ApiResponse<Page<AnimalResponse>> response = animalService.getMyReports(pageable);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/my-stats")
    @Operation(summary = "Get user statistics", description = "Get statistics for the current user")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('PUBLIC_USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getMyStats() {
        ApiResponse<UserStatsResponse> response = animalService.getMyStats();
        return ResponseEntity.status(response.getCode()).body(response);
    }
} 