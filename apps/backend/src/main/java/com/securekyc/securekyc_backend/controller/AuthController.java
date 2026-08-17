package com.securekyc.securekyc_backend.controller;

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

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

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

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toAuthResponse(user));
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user = authService.login(request);

        return ResponseEntity.ok(toAuthResponse(user));
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
        return ResponseEntity.ok(new SuccessResponse("Signed out."));
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
                user.getRole().name(),
                jwtService.generateToken(user)
        );
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