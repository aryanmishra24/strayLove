package com.straylove.repository;

import com.straylove.entity.Animal;
import com.straylove.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {
    
    Page<Animal> findBySpecies(Animal.AnimalSpecies species, Pageable pageable);
    
    Page<Animal> findByApprovalStatus(Animal.ApprovalStatus approvalStatus, Pageable pageable);
    
    Page<Animal> findBySpeciesAndApprovalStatus(Animal.AnimalSpecies species, Animal.ApprovalStatus approvalStatus, Pageable pageable);
    
    @Query("SELECT a FROM Animal a JOIN a.locations l WHERE l.area = :area")
    Page<Animal> findByArea(@Param("area") String area, Pageable pageable);
    
    @Query("SELECT a FROM Animal a JOIN a.locations l WHERE l.area = :area AND a.species = :species")
    Page<Animal> findByAreaAndSpecies(@Param("area") String area, @Param("species") Animal.AnimalSpecies species, Pageable pageable);
    
    @Query("SELECT a FROM Animal a JOIN a.locations l WHERE LOWER(l.area) LIKE LOWER(CONCAT('%', :area, '%'))")
    Page<Animal> findByLocationsAreaContainingIgnoreCase(@Param("area") String area, Pageable pageable);
    
    @Query("SELECT a FROM Animal a JOIN a.locations l WHERE a.species = :species AND LOWER(l.area) LIKE LOWER(CONCAT('%', :area, '%'))")
    Page<Animal> findBySpeciesAndLocationsAreaContainingIgnoreCase(@Param("species") Animal.AnimalSpecies species, @Param("area") String area, Pageable pageable);
    
    @Query(value = "SELECT a.* FROM animals a " +
            "JOIN animal_locations al ON a.id = al.animal_id " +
            "WHERE al.is_current = true " +
            "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(al.latitude)) * " +
            "cos(radians(al.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
            "sin(radians(al.latitude)))) <= :radius", 
            nativeQuery = true)
    List<Animal> findNearbyAnimals(@Param("latitude") Double latitude, 
                                   @Param("longitude") Double longitude, 
                                   @Param("radius") Double radius);

    // User-specific queries
    Page<Animal> findByReportedBy(User reportedBy, Pageable pageable);
    
    long countByReportedBy(User reportedBy);
    
    @Query("SELECT COUNT(DISTINCT a.id) FROM Animal a WHERE a.reportedBy = :reportedBy")
    long countDistinctAnimalsByReportedBy(@Param("reportedBy") User reportedBy);
    
    long countByReportedByAndCreatedAtAfter(User reportedBy, LocalDateTime after);
} 