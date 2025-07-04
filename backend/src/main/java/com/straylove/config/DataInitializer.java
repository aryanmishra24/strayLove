package com.straylove.config;

import com.straylove.entity.User;
import com.straylove.entity.User.UserRole;
import com.straylove.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        // Create admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@straylove.com")) {
            User adminUser = User.builder()
                    .username("admin")
                    .name("System Administrator")
                    .email("admin@straylove.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            log.info("Created admin user: admin@straylove.com");
        }

        // Create a test volunteer user if it doesn't exist
        if (!userRepository.existsByEmail("volunteer@straylove.com")) {
            User volunteerUser = User.builder()
                    .username("volunteer")
                    .name("Test Volunteer")
                    .email("volunteer@straylove.com")
                    .passwordHash(passwordEncoder.encode("volunteer123"))
                    .role(UserRole.VOLUNTEER)
                    .isActive(true)
                    .build();
            userRepository.save(volunteerUser);
            log.info("Created volunteer user: volunteer@straylove.com");
        }

        // Create a test public user if it doesn't exist
        if (!userRepository.existsByEmail("user@straylove.com")) {
            User publicUser = User.builder()
                    .username("user")
                    .name("Test User")
                    .email("user@straylove.com")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .role(UserRole.PUBLIC_USER)
                    .isActive(true)
                    .build();
            userRepository.save(publicUser);
            log.info("Created public user: user@straylove.com");
        }

        // Create another test user for promotion testing
        if (!userRepository.existsByEmail("john.doe@example.com")) {
            User testUser = User.builder()
                    .username("johndoe")
                    .name("John Doe")
                    .email("john.doe@example.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(UserRole.PUBLIC_USER)
                    .isActive(true)
                    .build();
            userRepository.save(testUser);
            log.info("Created test user: john.doe@example.com");
        }

        // Create another test user for promotion testing
        if (!userRepository.existsByEmail("jane.smith@example.com")) {
            User testUser2 = User.builder()
                    .username("janesmith")
                    .name("Jane Smith")
                    .email("jane.smith@example.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(UserRole.PUBLIC_USER)
                    .isActive(true)
                    .build();
            userRepository.save(testUser2);
            log.info("Created test user: jane.smith@example.com");
        }

        log.info("Data initialization completed. Total users: {}", userRepository.count());
    }
} 