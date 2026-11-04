package com.devsphere.projectservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class InternalTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(InternalTokenVerifier.class);

    private final String internalSecret;
    private final String expectedAudience;

    public InternalTokenVerifier(
            @Value("${devsphere.internal.secret:devsphere-hybrid-internal-key-2026}") String internalSecret,
            @Value("${devsphere.service.name:project-service}") String expectedAudience) {
        this.internalSecret = internalSecret;
        this.expectedAudience = expectedAudience;
    }

    public InternalUserPrincipal verify(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        String rawToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();

        try {
            SecretKey key = Keys.hmacShaKeyFor(internalSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer("devsphere-core")
                    .requireAudience(expectedAudience)
                    .build()
                    .parseSignedClaims(rawToken)
                    .getPayload();

            String sub = claims.getSubject();
            if (sub == null || sub.isBlank() || "anonymous".equalsIgnoreCase(sub)) {
                return null;
            }

            UUID userId = UUID.fromString(sub);
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);

            return new InternalUserPrincipal(userId, username, role);
        } catch (Exception e) {
            log.warn("Cryptographic verification of internal token failed: {}", e.getMessage());
            return null;
        }
    }
}
