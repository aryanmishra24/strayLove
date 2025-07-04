package com.straylove.config;

import com.straylove.entity.User;
import com.straylove.entity.User.UserRole;
import com.straylove.repository.UserRepository;
import com.straylove.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestConfiguration
public class TestConfig {

    @Autowired
    private UserRepository userRepository;

    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider();
    }

    @Bean
    public CommandLineRunner testDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create test admin user
            if (!userRepository.existsByEmail("admin@test.com")) {
                User adminUser = User.builder()
                        .username("admin")
                        .name("Test Admin")
                        .email("admin@test.com")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN)
                        .isActive(true)
                        .build();
                userRepository.save(adminUser);
            }

            // Create test volunteer user
            if (!userRepository.existsByEmail("volunteer@test.com")) {
                User volunteerUser = User.builder()
                        .username("volunteer")
                        .name("Test Volunteer")
                        .email("volunteer@test.com")
                        .passwordHash(passwordEncoder.encode("volunteer123"))
                        .role(UserRole.VOLUNTEER)
                        .isActive(true)
                        .build();
                userRepository.save(volunteerUser);
            }

            // Create test public user
            if (!userRepository.existsByEmail("user@test.com")) {
                User publicUser = User.builder()
                        .username("user")
                        .name("Test User")
                        .email("user@test.com")
                        .passwordHash(passwordEncoder.encode("user123"))
                        .role(UserRole.PUBLIC_USER)
                        .isActive(true)
                        .build();
                userRepository.save(publicUser);
            }
        };
    }

    /**
     * Cleans up test data
     */
    public void cleanup() {
        userRepository.deleteAll();
    }
} 