package com.securekyc.securekyc_backend.config;

import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.UserRepository;
import com.securekyc.securekyc_backend.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String SESSION_SUPERSEDED_ATTR = "sessionSuperseded";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                Claims claims = jwtService.parseClaims(token);
                String email = claims.getSubject();
                String role = claims.get("role", String.class);
                String sessionId = claims.get("sid", String.class);

                User user = email == null ? null : userRepository.findByEmail(email).orElse(null);
                boolean sessionMatches = user != null
                        && sessionId != null
                        && sessionId.equals(user.getSessionId());

                if (sessionMatches) {
                    if (role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        var authToken = new UsernamePasswordAuthenticationToken(email, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } else if (user != null && user.getSessionId() != null) {
                    // A valid, non-expired token — but a newer login elsewhere has
                    // since superseded it (as opposed to a plain logout, where
                    // getSessionId() is null on the account). Leave unauthenticated
                    // and flag why, so the entry point can return a specific reason.
                    request.setAttribute(SESSION_SUPERSEDED_ATTR, true);
                }
                // else: account has no active session (logged out, or never
                // logged in under this scheme) — leave unauthenticated, no
                // special flag; the entry point falls back to a plain message.
            } catch (JwtException | IllegalArgumentException ignored) {
                // Invalid/expired token: leave the request unauthenticated.
                // Downstream authorization (permitAll vs authenticated) decides the outcome.
            }
        }

        filterChain.doFilter(request, response);
    }
}
