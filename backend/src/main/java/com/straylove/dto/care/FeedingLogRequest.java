package com.straylove.dto.care;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedingLogRequest {

    @NotNull(message = "Feeding time is required")
    private LocalDateTime feedingTime;

    private String foodType;

    private String quantity;
} 