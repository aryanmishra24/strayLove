package com.straylove.dto.community;

import com.straylove.entity.CommunityLog;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityLogRequest {

    @NotNull(message = "Log type is required")
    private CommunityLog.LogType logType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Urgency level is required")
    private CommunityLog.UrgencyLevel urgencyLevel;
} 