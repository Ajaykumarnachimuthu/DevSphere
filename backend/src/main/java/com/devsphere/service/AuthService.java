package com.devsphere.service;

import com.devsphere.dto.request.LoginRequest;
import com.devsphere.dto.request.RegisterRequest;
import com.devsphere.dto.response.AuthResponse;
import com.devsphere.dto.response.UserResponse;

import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(UUID userId);

    void logout(UUID userId);
}
