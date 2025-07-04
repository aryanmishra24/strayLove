package com.straylove.dto.animal;

import com.straylove.entity.Animal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnimalResponse {

    private Long id;
    private String uniqueIdentifier;
    private String name;
    private Animal.AnimalSpecies species;
    private String breed;
    private String color;
    private Animal.Gender gender;
    private String age;
    private Animal.Temperament temperament;
    private Animal.HealthStatus healthStatus;
    private boolean isVaccinated;
    private boolean isSterilized;
    private Animal.ApprovalStatus approvalStatus;
    private String reportedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastSeenAt;
    private String description;
    private List<AnimalLocationResponse> locations;
    private List<String> imageUrls;
} 