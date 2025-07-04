package com.straylove.dto.animal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private Long totalReports;
    private Long totalCommunityLogs;
    private Long totalUpvotes;
    private Long animalsHelped;
    private Long recentActivity;
} 