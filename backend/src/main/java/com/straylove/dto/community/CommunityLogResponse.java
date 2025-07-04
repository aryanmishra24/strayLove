package com.straylove.dto.community;

import com.straylove.entity.CommunityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityLogResponse {

    private Long id;
    private Long animalId;
    private String animalName;
    private String animalSpecies;
    private Long loggedById;
    private String loggedByName;
    private String loggedByEmail;
    private CommunityLog.LogType logType;
    private String description;
    private CommunityLog.UrgencyLevel urgencyLevel;
    private Integer upvoteCount;
    private LocalDateTime createdAt;
    private Boolean isUpvotedByCurrentUser; // Whether current user has upvoted this log
} 