package com.straylove.dto.care;

import com.straylove.entity.CareRecord;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareRecordRequest {

    @NotNull(message = "Care type is required")
    private CareRecord.CareType careType;

    @NotNull(message = "Care date is required")
    private LocalDate careDate;

    private String description;
} 