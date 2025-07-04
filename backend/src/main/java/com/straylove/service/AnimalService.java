package com.straylove.service;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.animal.AnimalResponse;
import com.straylove.dto.animal.AnimalLocationResponse;
import com.straylove.dto.animal.CreateAnimalRequest;
import com.straylove.dto.animal.UserStatsResponse;
import com.straylove.entity.Animal;
import com.straylove.entity.AnimalLocation;
import com.straylove.entity.AnimalImage;
import com.straylove.entity.User;
import com.straylove.mapper.AnimalMapper;
import com.straylove.repository.AnimalRepository;
import com.straylove.repository.AnimalImageRepository;
import com.straylove.repository.UserRepository;
import com.straylove.repository.CommunityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final AnimalImageRepository animalImageRepository;
    private final CommunityLogRepository communityLogRepository;
    private final AnimalMapper animalMapper;
    private final FileStorageService fileStorageService;

    public ApiResponse<AnimalResponse> reportAnimal(CreateAnimalRequest request) {
        return reportAnimal(request, null);
    }

    public ApiResponse<AnimalResponse> reportAnimal(CreateAnimalRequest request, List<MultipartFile> images) {
        try {
            log.info("Starting animal report process for species: {}", request.getSpecies());
            
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            log.info("Found user: {}", currentUser.getEmail());

            // Create animal entity
            Animal animal = animalMapper.toEntity(request);
            animal.setUniqueIdentifier(generateUniqueIdentifier());
            animal.setReportedBy(currentUser);
            
            log.info("Created animal entity with ID: {}", animal.getUniqueIdentifier());

            // Create location
            AnimalLocation location = AnimalLocation.builder()
                    .animal(animal)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .address(request.getAddress())
                    .area(request.getArea())
                    .city(request.getCity())
                    .isCurrent(true)
                    .build();
            
            log.info("Created location for animal");

            animal.setLocations(List.of(location));

            // Save animal first (location will be saved due to cascade)
            Animal savedAnimal = animalRepository.save(animal);
            log.info("Animal saved successfully: {} with ID: {}", savedAnimal.getUniqueIdentifier(), savedAnimal.getId());

            // Handle images if provided
            if (images != null && !images.isEmpty()) {
                log.info("Processing {} images for animal report", images.size());
                List<AnimalImage> animalImages = new ArrayList<>();
                
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile image = images.get(i);
                    try {
                        // Store the file
                        String imageUrl = fileStorageService.storeFile(image);
                        
                        // Create AnimalImage entity
                        AnimalImage animalImage = AnimalImage.builder()
                                .animal(savedAnimal)
                                .imageUrl(imageUrl)
                                .caption("Image " + (i + 1))
                                .isPrimary(i == 0) // First image is primary
                                .build();
                        
                        animalImages.add(animalImage);
                        log.info("Stored image {}: {} for animal: {}", i + 1, imageUrl, savedAnimal.getUniqueIdentifier());
                    } catch (Exception e) {
                        log.error("Failed to store image {} for animal: {}", i + 1, savedAnimal.getUniqueIdentifier(), e);
                        // Continue with other images instead of failing the entire transaction
                    }
                }
                
                // Save all images
                if (!animalImages.isEmpty()) {
                    try {
                        animalImageRepository.saveAll(animalImages);
                        log.info("Saved {} images for animal: {}", animalImages.size(), savedAnimal.getUniqueIdentifier());
                    } catch (Exception e) {
                        log.error("Failed to save images to database for animal: {}", savedAnimal.getUniqueIdentifier(), e);
                        // Continue without images rather than failing the entire transaction
                    }
                }
            }

            // Map to response
            AnimalResponse response = animalMapper.toResponse(savedAnimal);
            
            // Get the saved images from database to ensure we have the latest data
            try {
                List<AnimalImage> savedImages = animalImageRepository.findByAnimalIdOrderByIsPrimaryDescCreatedAtAsc(savedAnimal.getId());
                if (savedImages != null && !savedImages.isEmpty()) {
                    List<String> imageUrls = savedImages.stream()
                        .map(AnimalImage::getImageUrl)
                        .collect(java.util.stream.Collectors.toList());
                    response.setImageUrls(imageUrls);
                    log.info("Set {} image URLs in response for animal: {}", imageUrls.size(), savedAnimal.getUniqueIdentifier());
                    log.info("Image URLs: {}", imageUrls);
                } else {
                    log.warn("No images found for animal: {}", savedAnimal.getUniqueIdentifier());
                }
            } catch (Exception e) {
                log.error("Failed to retrieve images for animal: {}", savedAnimal.getUniqueIdentifier(), e);
                // Continue without images in response
            }
            
            log.info("Animal reported successfully: {} by user: {}", 
                    savedAnimal.getUniqueIdentifier(), currentUser.getEmail());

            return ApiResponse.success("Animal reported successfully", response);
        } catch (Exception e) {
            log.error("Failed to report animal", e);
            
            // Check if it's a constraint violation for species
            if (e.getMessage() != null && e.getMessage().contains("animals_species_check")) {
                return ApiResponse.error(400, "Invalid species. The database constraint needs to be updated to include BIRD. Please contact the administrator.");
            }
            
            return ApiResponse.error(500, "Failed to report animal: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<AnimalResponse> updateAnimal(Long id, CreateAnimalRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Find existing animal
            Animal animal = animalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Animal not found"));

            // Check if user is authorized to update this animal
            if (!animal.getReportedBy().getId().equals(currentUser.getId())) {
                return ApiResponse.error(403, "You can only update animals that you reported");
            }

            // Update animal fields
            animal.setSpecies(request.getSpecies());
            animal.setBreed(request.getBreed());
            animal.setColor(request.getColor());
            animal.setGender(request.getGender());
            animal.setTemperament(request.getTemperament());
            animal.setHealthStatus(request.getHealthStatus());

            // Update or create new location
            AnimalLocation newLocation = AnimalLocation.builder()
                    .animal(animal)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .address(request.getAddress())
                    .area(request.getArea())
                    .city(request.getCity())
                    .isCurrent(true)
                    .build();

            // Set previous locations as not current
            if (animal.getLocations() != null) {
                animal.getLocations().forEach(loc -> loc.setCurrent(false));
            }

            // Add new location
            List<AnimalLocation> updatedLocations = animal.getLocations() != null ? 
                new ArrayList<>(animal.getLocations()) : new ArrayList<>();
            updatedLocations.add(newLocation);
            animal.setLocations(updatedLocations);

            // Save updated animal
            Animal savedAnimal = animalRepository.save(animal);

            // Map to response
            AnimalResponse response = animalMapper.toResponse(savedAnimal);
            
            // Manually set imageUrls
            if (savedAnimal.getImages() != null) {
                List<String> imageUrls = savedAnimal.getImages().stream()
                    .map(AnimalImage::getImageUrl)
                    .collect(java.util.stream.Collectors.toList());
                response.setImageUrls(imageUrls);
            }
            
            log.info("Animal updated successfully: {} by user: {}", 
                    savedAnimal.getUniqueIdentifier(), currentUser.getEmail());

            return ApiResponse.success("Animal updated successfully", response);
        } catch (Exception e) {
            log.error("Failed to update animal", e);
            return ApiResponse.error(500, "Failed to update animal: " + e.getMessage());
        }
    }

    private String generateUniqueIdentifier() {
        return "ANIMAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public ApiResponse<Page<AnimalResponse>> searchAnimals(
            Animal.AnimalSpecies species,
            String area,
            Animal.ApprovalStatus approvalStatus,
            Pageable pageable) {
        try {
            Page<Animal> animalsPage;
            if (species != null && area != null && approvalStatus != null) {
                animalsPage = animalRepository.findBySpeciesAndApprovalStatus(species, approvalStatus, pageable);
            } else if (species != null && approvalStatus != null) {
                animalsPage = animalRepository.findBySpeciesAndApprovalStatus(species, approvalStatus, pageable);
            } else if (area != null && approvalStatus != null) {
                // No direct repo method, so filter after fetch
                animalsPage = animalRepository.findByApprovalStatus(approvalStatus, pageable);
                animalsPage = animalsPage.map(animal -> animal);
            } else if (approvalStatus != null) {
                animalsPage = animalRepository.findByApprovalStatus(approvalStatus, pageable);
            } else {
                animalsPage = animalRepository.findAll(pageable);
            }
            Page<AnimalResponse> responsePage = animalsPage.map(animal -> {
                AnimalResponse response = animalMapper.toResponse(animal);
                if (animal.getLocations() != null) {
                    List<AnimalLocationResponse> locationResponses = animal.getLocations().stream()
                        .map(location -> AnimalLocationResponse.builder()
                            .latitude(location.getLatitude())
                            .longitude(location.getLongitude())
                            .address(location.getAddress())
                            .area(location.getArea())
                            .city(location.getCity())
                            .isCurrent(location.isCurrent())
                            .build())
                        .collect(java.util.stream.Collectors.toList());
                    response.setLocations(locationResponses);
                }
                if (animal.getImages() != null) {
                    List<String> imageUrls = animal.getImages().stream()
                        .map(AnimalImage::getImageUrl)
                        .collect(java.util.stream.Collectors.toList());
                    response.setImageUrls(imageUrls);
                }
                return response;
            });
            log.info("Animals search completed: {} results", responsePage.getTotalElements());
            return ApiResponse.success("Animals retrieved successfully", responsePage);
        } catch (Exception e) {
            log.error("Failed to search animals", e);
            return ApiResponse.error(500, "Failed to search animals: " + e.getMessage());
        }
    }

    public ApiResponse<AnimalResponse> getAnimalById(Long id) {
        try {
            Animal animal = animalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Animal not found"));
            
            AnimalResponse response = animalMapper.toResponse(animal);
            
            // Manually set locations and imageUrls
            if (animal.getLocations() != null) {
                List<AnimalLocationResponse> locationResponses = animal.getLocations().stream()
                    .map(location -> AnimalLocationResponse.builder()
                        .latitude(location.getLatitude())
                        .longitude(location.getLongitude())
                        .address(location.getAddress())
                        .area(location.getArea())
                        .city(location.getCity())
                        .isCurrent(location.isCurrent())
                        .build())
                    .collect(java.util.stream.Collectors.toList());
                response.setLocations(locationResponses);
            }
            
            if (animal.getImages() != null) {
                List<String> imageUrls = animal.getImages().stream()
                    .map(AnimalImage::getImageUrl)
                    .collect(java.util.stream.Collectors.toList());
                response.setImageUrls(imageUrls);
            }
            
            log.info("Animal retrieved successfully: {}", animal.getUniqueIdentifier());
            
            return ApiResponse.success("Animal retrieved successfully", response);
        } catch (Exception e) {
            log.error("Failed to get animal by ID: {}", id, e);
            return ApiResponse.error(500, "Failed to get animal: " + e.getMessage());
        }
    }

    public ApiResponse<Page<AnimalResponse>> getMyReports(Pageable pageable) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get animals reported by current user
            Page<Animal> animalsPage = animalRepository.findByReportedBy(currentUser, pageable);
            
            Page<AnimalResponse> responsePage = animalsPage.map(animal -> {
                AnimalResponse response = animalMapper.toResponse(animal);
                
                // Manually set locations and imageUrls
                if (animal.getLocations() != null) {
                    List<AnimalLocationResponse> locationResponses = animal.getLocations().stream()
                        .map(location -> AnimalLocationResponse.builder()
                            .latitude(location.getLatitude())
                            .longitude(location.getLongitude())
                            .address(location.getAddress())
                            .area(location.getArea())
                            .city(location.getCity())
                            .isCurrent(location.isCurrent())
                            .build())
                        .collect(java.util.stream.Collectors.toList());
                    response.setLocations(locationResponses);
                }
                
                if (animal.getImages() != null) {
                    List<String> imageUrls = animal.getImages().stream()
                        .map(AnimalImage::getImageUrl)
                        .collect(java.util.stream.Collectors.toList());
                    response.setImageUrls(imageUrls);
                }
                
                return response;
            });
            
            log.info("User reports retrieved successfully for user: {}", currentUser.getEmail());
            
            return ApiResponse.success("User reports retrieved successfully", responsePage);
        } catch (Exception e) {
            log.error("Failed to get user reports", e);
            return ApiResponse.error(500, "Failed to get user reports: " + e.getMessage());
        }
    }

    public ApiResponse<UserStatsResponse> getMyStats() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get user statistics
            Long totalReports = animalRepository.countByReportedBy(currentUser);
            Long totalCommunityLogs = communityLogRepository.countByLoggedById(currentUser.getId());
            Long totalUpvotes = communityLogRepository.sumUpvotesByLoggedById(currentUser.getId());
            Long animalsHelped = animalRepository.countDistinctAnimalsByReportedBy(currentUser);
            Long recentActivity = animalRepository.countByReportedByAndCreatedAtAfter(
                currentUser, 
                java.time.LocalDateTime.now().minusDays(7)
            );

            UserStatsResponse stats = UserStatsResponse.builder()
                    .totalReports(totalReports)
                    .totalCommunityLogs(totalCommunityLogs)
                    .totalUpvotes(totalUpvotes != null ? totalUpvotes : 0L)
                    .animalsHelped(animalsHelped)
                    .recentActivity(recentActivity)
                    .build();
            
            log.info("User stats retrieved successfully for user: {}", currentUser.getEmail());
            
            return ApiResponse.success("User statistics retrieved successfully", stats);
        } catch (Exception e) {
            log.error("Failed to get user stats", e);
            return ApiResponse.error(500, "Failed to get user statistics: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<AnimalResponse> setAnimalApprovalStatus(Long id, Animal.ApprovalStatus status) {
        try {
            Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal not found"));
            animal.setApprovalStatus(status);
            Animal savedAnimal = animalRepository.save(animal);
            AnimalResponse response = animalMapper.toResponse(savedAnimal);
            if (savedAnimal.getImages() != null) {
                List<String> imageUrls = savedAnimal.getImages().stream()
                    .map(AnimalImage::getImageUrl)
                    .collect(java.util.stream.Collectors.toList());
                response.setImageUrls(imageUrls);
            }
            return ApiResponse.success("Animal approval status updated", response);
        } catch (Exception e) {
            log.error("Failed to update animal approval status", e);
            return ApiResponse.error(500, "Failed to update animal approval status: " + e.getMessage());
        }
    }

    public ApiResponse<List<AnimalResponse>> getNearbyAnimals(Double latitude, Double longitude, Double radius) {
        try {
            log.info("Searching for animals near lat: {}, lon: {}, radius: {} km", latitude, longitude, radius);
            
            // Get nearby animals from repository
            List<Animal> nearbyAnimals = animalRepository.findNearbyAnimals(latitude, longitude, radius);
            
            // Filter for approved animals only (non-admin users should only see approved animals)
            List<Animal> approvedAnimals = nearbyAnimals.stream()
                .filter(animal -> animal.getApprovalStatus() == Animal.ApprovalStatus.APPROVED)
                .collect(java.util.stream.Collectors.toList());
            
            // Map to response DTOs
            List<AnimalResponse> animalResponses = approvedAnimals.stream()
                .map(animal -> {
                    AnimalResponse response = animalMapper.toResponse(animal);
                    
                    // Set locations
                    if (animal.getLocations() != null) {
                        List<AnimalLocationResponse> locationResponses = animal.getLocations().stream()
                            .map(location -> AnimalLocationResponse.builder()
                                .latitude(location.getLatitude())
                                .longitude(location.getLongitude())
                                .address(location.getAddress())
                                .area(location.getArea())
                                .city(location.getCity())
                                .isCurrent(location.isCurrent())
                                .build())
                            .collect(java.util.stream.Collectors.toList());
                        response.setLocations(locationResponses);
                    }
                    
                    // Set image URLs
                    if (animal.getImages() != null) {
                        List<String> imageUrls = animal.getImages().stream()
                            .map(AnimalImage::getImageUrl)
                            .collect(java.util.stream.Collectors.toList());
                        response.setImageUrls(imageUrls);
                    }
                    
                    return response;
                })
                .collect(java.util.stream.Collectors.toList());
            
            log.info("Found {} nearby approved animals", animalResponses.size());
            return ApiResponse.success("Nearby animals retrieved successfully", animalResponses);
        } catch (Exception e) {
            log.error("Failed to get nearby animals", e);
            return ApiResponse.error(500, "Failed to get nearby animals: " + e.getMessage());
        }
    }
} 