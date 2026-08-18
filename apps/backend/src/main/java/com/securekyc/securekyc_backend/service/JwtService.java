package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    public static final long EXPIRY_SECONDS = 8 * 60 * 60; // 8 hours — also used as the session cookie's Max-Age
    private static final long EXPIRY_MILLIS = EXPIRY_SECONDS * 1000L;

    private final SecretKey signingKey;

    public JwtService(@Value("${security.jwt.secret}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be configured and contain at least 32 characters."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getFullName())
                .claim("sid", user.getSessionId())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(EXPIRY_MILLIS)))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
