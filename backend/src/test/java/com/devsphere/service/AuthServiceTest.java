package com.devsphere.service;

import com.devsphere.dto.request.LoginRequest;
import com.devsphere.dto.request.RegisterRequest;
import com.devsphere.dto.response.AuthResponse;
import com.devsphere.dto.response.UserResponse;
import com.devsphere.entity.DeveloperProfile;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.exception.DuplicateResourceException;
import com.devsphere.exception.UnauthorizedException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.security.JwtTokenProvider;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeveloperProfileRepository developerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    private EntityDtoMapper mapper;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();
        authService = new AuthServiceImpl(
                userRepository,
                developerProfileRepository,
                passwordEncoder,
                tokenProvider,
                authenticationManager,
                mapper
        );
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("testuser", "test@devsphere.io", "password123");

        when(userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase("test@devsphere.io", "testuser"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User("testuser", "test@devsphere.io", "encodedPassword", Role.ROLE_USER);
        savedUser.setId(UUID.randomUUID());
        savedUser.setCreatedAt(Instant.now());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(developerProfileRepository.save(any(DeveloperProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(tokenProvider.generateToken(any(UserPrincipal.class))).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("test@devsphere.io");
        assertThat(response.getUser().getUsername()).isEqualTo("testuser");

        verify(userRepository).save(any(User.class));
        verify(developerProfileRepository).save(any(DeveloperProfile.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("testuser", "existing@devsphere.io", "password123");

        User existingUser = new User("otheruser", "existing@devsphere.io", "hash", Role.ROLE_USER);
        when(userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase("existing@devsphere.io", "testuser"))
                .thenReturn(Optional.of(existingUser));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email is already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("test@devsphere.io", "password123");
        UUID userId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(userId, "testuser", "test@devsphere.io", "encodedPassword", List.of());
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(principal)).thenReturn("valid-jwt");

        User user = new User("testuser", "test@devsphere.io", "encodedPassword", Role.ROLE_USER);
        user.setId(userId);
        user.setCreatedAt(Instant.now());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("valid-jwt");
        assertThat(response.getUser().getEmail()).isEqualTo("test@devsphere.io");
    }

    @Test
    void login_BadCredentials_ThrowsUnauthorizedException() {
        LoginRequest request = new LoginRequest("test@devsphere.io", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void getCurrentUser_Success() {
        UUID userId = UUID.randomUUID();
        User user = new User("testuser", "test@devsphere.io", "encodedPassword", Role.ROLE_USER);
        user.setId(userId);
        user.setCreatedAt(Instant.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser(userId);

        assertThat(response.getId()).isEqualTo(userId);
        assertThat(response.getUsername()).isEqualTo("testuser");
    }
}
