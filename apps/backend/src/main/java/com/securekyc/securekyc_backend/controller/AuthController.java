package com.securekyc.securekyc_backend.controller;

import com.securekyc.securekyc_backend.config.JwtAuthenticationFilter;
import com.securekyc.securekyc_backend.dto.AuthResponse;
import com.securekyc.securekyc_backend.dto.ForgotPasswordRequest;
import com.securekyc.securekyc_backend.dto.LoginRequest;
import com.securekyc.securekyc_backend.dto.RegisterRequest;
import com.securekyc.securekyc_backend.dto.ResetPasswordRequest;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.UserRepository;
import com.securekyc.securekyc_backend.service.AuthService;
import com.securekyc.securekyc_backend.service.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthService authService, JwtService jwtService, UserRepository userRepository) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);
        String token = jwtService.generateToken(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildSessionCookie(token).toString())
                .body(toAuthResponse(user));
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user = authService.login(request);
        String token = jwtService.generateToken(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildSessionCookie(token).toString())
                .body(toAuthResponse(user));
    }

    // =========================
    // CURRENT SESSION
    // =========================

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));

        return ResponseEntity.ok(toAuthResponse(user));
    }

    // =========================
    // LOGOUT
    // =========================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearSessionCookie().toString())
                .body(new SuccessResponse("Signed out."));
    }

    // =========================
    // FORGOT PASSWORD
    // =========================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {

            authService.forgotPassword(request);

            return ResponseEntity.ok(
                    new SuccessResponse(
                            "Password reset instructions have been sent to your email."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // =========================
    // RESET PASSWORD
    // =========================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {

            authService.resetPassword(request);

            return ResponseEntity.ok(
                    new SuccessResponse(
                            "Password has been reset successfully."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getEmployeeId(),
                user.getRole().name()
        );
    }

    /**
     * httpOnly so client-side JS can never read the token (closes the
     * XSS-can-steal-the-session gap that plain localStorage storage has).
     * SameSite=Lax is enough since the frontend/backend share "localhost" as
     * their site in dev; a cross-domain production deployment would need
     * either a shared parent domain or a same-origin proxy in front of this API.
     */
    private ResponseCookie buildSessionCookie(String token) {
        return ResponseCookie.from(JwtAuthenticationFilter.SESSION_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(JwtService.EXPIRY_SECONDS)
                .build();
    }

    private ResponseCookie clearSessionCookie() {
        return ResponseCookie.from(JwtAuthenticationFilter.SESSION_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    // =========================
    // RESPONSE CLASSES
    // =========================

    static class ErrorResponse {

        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    static class SuccessResponse {

        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}