package com.straylove.dto.care;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedingLogResponse {

    private Long id;
    private Long animalId;
    private String animalName;
    private String animalSpecies;
    private LocalDateTime feedingTime;
    private String foodType;
    private String quantity;
    private Long fedById;
    private String fedByName;
    private String fedByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 