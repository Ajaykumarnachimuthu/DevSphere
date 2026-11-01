package com.devsphere.controller;

import com.devsphere.dto.request.LoginRequest;
import com.devsphere.dto.request.RegisterRequest;
import com.devsphere.dto.response.AuthResponse;
import com.devsphere.dto.response.UserResponse;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for registration, login, and user profile")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive JWT access token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal,
            org.springframework.security.core.Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal p) {
            user = p;
        }
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse response = authService.getCurrentUser(user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            org.springframework.security.core.Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal p) {
            user = p;
        }
        if (user != null) {
            authService.logout(user.getId());
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
