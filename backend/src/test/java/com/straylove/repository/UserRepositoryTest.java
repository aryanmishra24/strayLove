package com.straylove.repository;

import com.straylove.entity.User;
import com.straylove.entity.User.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser1;
    private User testUser2;

    @BeforeEach
    void setUp() {
        // Clear the database
        entityManager.clear();

        // Create test users
        testUser1 = User.builder()
                .username("user1")
                .name("John Doe")
                .email("user1@example.com")
                .passwordHash("password123")
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();

        testUser2 = User.builder()
                .username("user2")
                .name("Jane Smith")
                .email("user2@example.com")
                .passwordHash("password456")
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
    }

    @Test
    void save_WithValidUser_ShouldPersistUser() {
        // Act
        User savedUser = userRepository.save(testUser1);

        // Assert
        assertNotNull(savedUser.getId());
        assertEquals(testUser1.getUsername(), savedUser.getUsername());
        assertEquals(testUser1.getName(), savedUser.getName());
        assertEquals(testUser1.getEmail(), savedUser.getEmail());
        assertEquals(testUser1.getRole(), savedUser.getRole());
        assertTrue(savedUser.isActive());
    }

    @Test
    void findById_WithExistingId_ShouldReturnUser() {
        // Arrange
        User savedUser = entityManager.persistAndFlush(testUser1);

        // Act
        Optional<User> foundUser = userRepository.findById(savedUser.getId());

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getId(), foundUser.get().getId());
        assertEquals(savedUser.getUsername(), foundUser.get().getUsername());
        assertEquals(savedUser.getEmail(), foundUser.get().getEmail());
    }

    @Test
    void findById_WithNonExistingId_ShouldReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findById(999L);

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void findByEmail_WithExistingEmail_ShouldReturnUser() {
        // Arrange
        entityManager.persistAndFlush(testUser1);

        // Act
        Optional<User> foundUser = userRepository.findByEmail(testUser1.getEmail());

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(testUser1.getEmail(), foundUser.get().getEmail());
        assertEquals(testUser1.getUsername(), foundUser.get().getUsername());
    }

    @Test
    void findByEmail_WithNonExistingEmail_ShouldReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void findByUsername_WithExistingUsername_ShouldReturnUser() {
        // Arrange
        entityManager.persistAndFlush(testUser1);

        // Act
        Optional<User> foundUser = userRepository.findByUsername(testUser1.getUsername());

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(testUser1.getUsername(), foundUser.get().getUsername());
        assertEquals(testUser1.getEmail(), foundUser.get().getEmail());
    }

    @Test
    void findByUsername_WithNonExistingUsername_ShouldReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("nonexistentuser");

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void existsByEmail_WithExistingEmail_ShouldReturnTrue() {
        // Arrange
        entityManager.persistAndFlush(testUser1);

        // Act
        boolean exists = userRepository.existsByEmail(testUser1.getEmail());

        // Assert
        assertTrue(exists);
    }

    @Test
    void existsByEmail_WithNonExistingEmail_ShouldReturnFalse() {
        // Act
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Assert
        assertFalse(exists);
    }

    @Test
    void existsByUsername_WithExistingUsername_ShouldReturnTrue() {
        // Arrange
        entityManager.persistAndFlush(testUser1);

        // Act
        boolean exists = userRepository.existsByUsername(testUser1.getUsername());

        // Assert
        assertTrue(exists);
    }

    @Test
    void existsByUsername_WithNonExistingUsername_ShouldReturnFalse() {
        // Act
        boolean exists = userRepository.existsByUsername("nonexistentuser");

        // Assert
        assertFalse(exists);
    }

    @Test
    void findAll_ShouldReturnAllUsers() {
        // Arrange
        entityManager.persistAndFlush(testUser1);
        entityManager.persistAndFlush(testUser2);

        // Act
        List<User> allUsers = userRepository.findAll();

        // Assert
        assertEquals(2, allUsers.size());
        assertTrue(allUsers.stream().anyMatch(user -> user.getEmail().equals(testUser1.getEmail())));
        assertTrue(allUsers.stream().anyMatch(user -> user.getEmail().equals(testUser2.getEmail())));
    }

    @Test
    void deleteById_WithExistingId_ShouldRemoveUser() {
        // Arrange
        User savedUser = entityManager.persistAndFlush(testUser1);

        // Act
        userRepository.deleteById(savedUser.getId());

        // Assert
        Optional<User> deletedUser = userRepository.findById(savedUser.getId());
        assertFalse(deletedUser.isPresent());
    }

    @Test
    void update_WithValidUser_ShouldUpdateUser() {
        // Arrange
        User savedUser = entityManager.persistAndFlush(testUser1);
        savedUser.setName("Updated Name");
        savedUser.setRole(UserRole.VOLUNTEER);

        // Act
        User updatedUser = userRepository.save(savedUser);

        // Assert
        assertEquals("Updated Name", updatedUser.getName());
        assertEquals(UserRole.VOLUNTEER, updatedUser.getRole());
        assertEquals(savedUser.getId(), updatedUser.getId());
        assertEquals(savedUser.getEmail(), updatedUser.getEmail());
    }
} 