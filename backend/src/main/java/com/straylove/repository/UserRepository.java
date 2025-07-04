package com.straylove.repository;

import com.straylove.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);
} 
 