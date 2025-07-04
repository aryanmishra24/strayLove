package com.straylove.mapper;

import com.straylove.dto.community.CommunityLogRequest;
import com.straylove.dto.community.CommunityLogResponse;
import com.straylove.entity.CommunityLog;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommunityLogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "animal", ignore = true)
    @Mapping(target = "loggedBy", ignore = true)
    @Mapping(target = "upvoteCount", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    CommunityLog toEntity(CommunityLogRequest request);

    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalName", expression = "java(communityLog.getAnimal().getUniqueIdentifier() != null ? communityLog.getAnimal().getUniqueIdentifier() : communityLog.getAnimal().getSpecies() + \" \" + communityLog.getAnimal().getBreed())")
    @Mapping(target = "animalSpecies", source = "animal.species")
    @Mapping(target = "loggedById", source = "loggedBy.id")
    @Mapping(target = "loggedByName", source = "loggedBy.name")
    @Mapping(target = "loggedByEmail", source = "loggedBy.email")
    @Mapping(target = "isUpvotedByCurrentUser", ignore = true) // Will be set by service
    CommunityLogResponse toResponse(CommunityLog communityLog);
} 