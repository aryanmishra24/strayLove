package com.straylove.repository;

import com.straylove.entity.AnimalImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalImageRepository extends JpaRepository<AnimalImage, Long> {
    
    List<AnimalImage> findByAnimalIdOrderByIsPrimaryDescCreatedAtAsc(Long animalId);
    
    AnimalImage findByAnimalIdAndIsPrimaryTrue(Long animalId);
    
    void deleteByAnimalId(Long animalId);
} 