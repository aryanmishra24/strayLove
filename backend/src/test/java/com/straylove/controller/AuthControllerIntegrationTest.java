package com.straylove.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.straylove.dto.auth.LoginRequest;
import com.straylove.dto.auth.RegisterRequest;
import com.straylove.dto.auth.RefreshTokenRequest;
import com.straylove.entity.User;
import com.straylove.entity.User.UserRole;
import com.straylove.repository.UserRepository;
import com.straylove.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        userRepository.deleteAll();
    }

    @Test
    void register_WithValidRequest_ShouldReturnSuccessResponse() throws Exception {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .username("testuser")
                .name("Test User")
                .email("test@example.com")
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        // Verify user was saved
        assertTrue(userRepository.findByEmail("test@example.com").isPresent());
    }

    @Test
    void register_WithExistingEmail_ShouldReturnBadRequest() throws Exception {
        // Arrange
        User existingUser = User.builder()
                .username("existinguser")
                .name("Existing User")
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
        userRepository.save(existingUser);

        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .name("New User")
                .email("test@example.com") // Same email
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // 400 Bad Request for duplicate email
    }

    @Test
    void register_WithInvalidRequest_ShouldReturnBadRequest() throws Exception {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .username("") // Invalid username
                .name("") // Invalid name
                .email("invalid-email") // Invalid email
                .password("") // Invalid password
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_WithValidCredentials_ShouldReturnAuthResponse() throws Exception {
        // Arrange
        User user = User.builder()
                .username("testuser")
                .name("Test User")
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.user.username").value("testuser"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("wrongpassword")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized for invalid credentials
    }

    @Test
    void refreshToken_WithValidToken_ShouldReturnNewAuthResponse() throws Exception {
        // Arrange
        User user = User.builder()
                .username("testuser")
                .name("Test User")
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
        userRepository.save(user);

        String refreshToken = jwtTokenProvider.generateRefreshTokenFromUsername("test@example.com");
        RefreshTokenRequest request = new RefreshTokenRequest(refreshToken);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.user.username").value("testuser"));
    }

    @Test
    void refreshToken_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
        // Arrange
        RefreshTokenRequest request = new RefreshTokenRequest("invalid-token");

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized for invalid token
    }
} 