package com.straylove.dto.care;

import com.straylove.entity.CareRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareRecordResponse {

    private Long id;
    private Long animalId;
    private String animalName;
    private String animalSpecies;
    private CareRecord.CareType careType;
    private LocalDate careDate;
    private String description;
    private Long performedById;
    private String performedByName;
    private String performedByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 