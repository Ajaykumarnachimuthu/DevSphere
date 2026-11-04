package com.devsphere.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class InternalTokenService {

    private final String internalSecret;

    public InternalTokenService(
            @Value("${devsphere.internal.secret:devsphere-hybrid-internal-key-2026}") String internalSecret
    ) {
        this.internalSecret = internalSecret;
    }

    public String generateToken(UserPrincipal principal, String targetAudience) {
        if (principal == null) {
            return null;
        }
        String role = principal.getRole() != null ? principal.getRole() : "ROLE_USER";
        return generateToken(principal.getId(), principal.getUsername(), role, targetAudience);
    }

    public String generateToken(UUID userId, String username, String role, String targetAudience) {
        if (userId == null) {
            return null;
        }
        SecretKey key = Keys.hmacShaKeyFor(internalSecret.getBytes(StandardCharsets.UTF_8));
        Instant now = Instant.now();

        return Jwts.builder()
                .issuer("devsphere-core")
                .subject(userId.toString())
                .audience().add(targetAudience).and()
                .claim("username", username != null ? username : "Developer")
                .claim("role", role != null ? role : "ROLE_USER")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(600))) // 10 minutes validity
                .signWith(key)
                .compact();
    }
}
