package com.devsphere.service.impl;

import com.devsphere.dto.request.LoginRequest;
import com.devsphere.dto.request.RegisterRequest;
import com.devsphere.dto.response.AuthResponse;
import com.devsphere.dto.response.UserResponse;
import com.devsphere.entity.DeveloperProfile;
import com.devsphere.entity.Role;
import com.devsphere.entity.User;
import com.devsphere.exception.DuplicateResourceException;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.exception.UnauthorizedException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.security.JwtTokenProvider;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EntityDtoMapper mapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            DeveloperProfileRepository developerProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager,
            EntityDtoMapper mapper
    ) {
        this.userRepository = userRepository;
        this.developerProfileRepository = developerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(email, username).ifPresent(existing -> {
            if (existing.getEmail().equalsIgnoreCase(email)) {
                throw new DuplicateResourceException("Email is already registered: " + email);
            }
            throw new DuplicateResourceException("Username is already taken: " + username);
        });

        User user = new User(
                username,
                email,
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_USER
        );
        User savedUser = userRepository.save(user);

        // Auto-provision developer profile for new user if one doesn't exist
        DeveloperProfile profile = new DeveloperProfile(
                username,
                "Developer",
                "New developer on DEVSphere. Passionate about learning and building.",
                "Worldwide",
                "a" + ((Math.abs(username.hashCode()) % 6) + 1),
                Set.of("Web Development")
        );
        profile.setUser(savedUser);
        developerProfileRepository.save(profile);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, mapper.toUserResponse(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = tokenProvider.generateToken(principal);
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            return new AuthResponse(token, mapper.toUserResponse(user));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        if (userId == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void logout(UUID userId) {
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                user.setTokenVersion(user.getTokenVersion() + 1);
                userRepository.save(user);
            });
        }
    }
}
