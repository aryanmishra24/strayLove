package com.straylove.service;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.auth.LoginRequest;
import com.straylove.dto.auth.RegisterRequest;
import com.straylove.dto.auth.AuthResponse;
import com.straylove.dto.auth.RefreshTokenRequest;
import com.straylove.entity.User;
import com.straylove.entity.User.UserRole;
import com.straylove.repository.UserRepository;
import com.straylove.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .name("Test User")
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .username("newuser")
                .name("New User")
                .email("new@example.com")
                .password("password123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    void register_WithValidRequest_ShouldReturnSuccessResponse() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ApiResponse<AuthResponse> response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("User registered successfully", response.getMessage());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository).existsByUsername(registerRequest.getUsername());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WithExistingEmail_ShouldReturnErrorResponse() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act
        ApiResponse<AuthResponse> response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals(400, response.getCode());
        assertEquals("Email already registered", response.getMessage());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_WithExistingUsername_ShouldReturnErrorResponse() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(true);

        // Act
        ApiResponse<AuthResponse> response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals(400, response.getCode());
        assertEquals("Username already taken", response.getMessage());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository).existsByUsername(registerRequest.getUsername());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_WithValidCredentials_ShouldReturnSuccessResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateToken(authentication)).thenReturn("accessToken");
        when(tokenProvider.generateRefreshToken(authentication)).thenReturn("refreshToken");

        // Act
        ApiResponse<AuthResponse> response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("Login successful", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("accessToken", response.getData().getToken());
        assertEquals("refreshToken", response.getData().getRefreshToken());
        assertEquals(testUser.getEmail(), response.getData().getUser().getEmail());
        assertEquals(testUser.getUsername(), response.getData().getUser().getUsername());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(tokenProvider).generateToken(authentication);
        verify(tokenProvider).generateRefreshToken(authentication);
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnErrorResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // Act
        ApiResponse<AuthResponse> response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(401, response.getCode());
        assertEquals("Invalid email or password", response.getMessage());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void refreshToken_WithValidToken_ShouldReturnSuccessResponse() {
        // Arrange
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest("validRefreshToken");
        when(tokenProvider.validateRefreshToken(refreshRequest.getRefreshToken())).thenReturn(true);
        when(tokenProvider.getUsernameFromRefreshToken(refreshRequest.getRefreshToken()))
                .thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateTokenFromUsername(testUser.getEmail())).thenReturn("newAccessToken");
        when(tokenProvider.generateRefreshTokenFromUsername(testUser.getEmail())).thenReturn("newRefreshToken");

        // Act
        ApiResponse<AuthResponse> response = authService.refreshToken(refreshRequest);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getCode());
        assertEquals("Token refreshed successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("newAccessToken", response.getData().getToken());
        assertEquals("newRefreshToken", response.getData().getRefreshToken());
        assertEquals(testUser.getEmail(), response.getData().getUser().getEmail());
        assertEquals(testUser.getUsername(), response.getData().getUser().getUsername());

        verify(tokenProvider).validateRefreshToken(refreshRequest.getRefreshToken());
        verify(tokenProvider).getUsernameFromRefreshToken(refreshRequest.getRefreshToken());
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(tokenProvider).generateTokenFromUsername(testUser.getEmail());
        verify(tokenProvider).generateRefreshTokenFromUsername(testUser.getEmail());
    }

    @Test
    void refreshToken_WithInvalidToken_ShouldReturnErrorResponse() {
        // Arrange
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest("invalidRefreshToken");
        when(tokenProvider.validateRefreshToken(refreshRequest.getRefreshToken())).thenReturn(false);

        // Act
        ApiResponse<AuthResponse> response = authService.refreshToken(refreshRequest);

        // Assert
        assertNotNull(response);
        assertEquals(401, response.getCode());
        assertEquals("Invalid refresh token", response.getMessage());

        verify(tokenProvider).validateRefreshToken(refreshRequest.getRefreshToken());
        verify(tokenProvider, never()).getUsernameFromRefreshToken(anyString());
    }

    @Test
    void refreshToken_WithNonExistentUser_ShouldReturnErrorResponse() {
        // Arrange
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest("validRefreshToken");
        when(tokenProvider.validateRefreshToken(refreshRequest.getRefreshToken())).thenReturn(true);
        when(tokenProvider.getUsernameFromRefreshToken(refreshRequest.getRefreshToken()))
                .thenReturn("nonexistent@example.com");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act
        ApiResponse<AuthResponse> response = authService.refreshToken(refreshRequest);

        // Assert
        assertNotNull(response);
        assertEquals(401, response.getCode());
        assertEquals("Token refresh failed", response.getMessage());

        verify(tokenProvider).validateRefreshToken(refreshRequest.getRefreshToken());
        verify(tokenProvider).getUsernameFromRefreshToken(refreshRequest.getRefreshToken());
        verify(userRepository).findByEmail("nonexistent@example.com");
    }
} 