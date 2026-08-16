package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.dto.ForgotPasswordRequest;
import com.securekyc.securekyc_backend.dto.LoginRequest;
import com.securekyc.securekyc_backend.dto.RegisterRequest;
import com.securekyc.securekyc_backend.dto.ResetPasswordRequest;
import com.securekyc.securekyc_backend.entity.PasswordResetToken;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.PasswordResetTokenRepository;
import com.securekyc.securekyc_backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // =========================
    // REGISTER
    // =========================

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }

        User.Role role = parseRole(request.getAccountType());
        String employeeId = request.getEmployeeId() == null ? "" : request.getEmployeeId().trim();

        if (role == User.Role.OFFICER) {
            if (employeeId.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Reviewer ID is required for an officer account.");
            }
            if (userRepository.existsByEmployeeId(employeeId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Reviewer ID is already registered.");
            }
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setEmployeeId(role == User.Role.OFFICER ? employeeId : null);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(role);
        user.setSessionId(UUID.randomUUID().toString());

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    public User login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "This account has been deactivated. Please contact an administrator.");
        }

        if (request.getAccountType() != null && !request.getAccountType().isBlank()
                && user.getRole() != parseRole(request.getAccountType())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account does not have the selected access type.");
        }

        // Minting a new session id here is what enforces "one active session per
        // account": any token issued for a previous login stops matching as soon
        // as this save commits, and is rejected on its next request.
        user.setSessionId(UUID.randomUUID().toString());

        return userRepository.save(user);
    }

    private User.Role parseRole(String accountType) {
        try {
            return User.Role.valueOf((accountType == null || accountType.isBlank()
                    ? "CUSTOMER" : accountType.trim().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid account type.");
        }
    }

    // =========================
    // LOGOUT
    // =========================

    public void logout(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }
        user.setSessionId(null);
        userRepository.save(user);
    }

    // =========================
    // FORGOT PASSWORD
    // =========================

    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("No account found with this email.")
                );

        // Remove any previous reset token for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());

        // Generate a secure random token
        String token = UUID.randomUUID().toString();

        // Token expires after 15 minutes
        LocalDateTime expiryDate =
                LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken =
                new PasswordResetToken(
                        token,
                        user,
                        expiryDate
                );

        passwordResetTokenRepository.save(resetToken);

        // Send reset email
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                token
        );
    }

    // =========================
    // RESET PASSWORD
    // =========================

    public void resetPassword(ResetPasswordRequest request) {

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(request.getToken())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid or expired reset link."
                                )
                        );

        // Check whether token has already been used
        if (resetToken.isUsed()) {
            throw new RuntimeException(
                    "This reset link has already been used."
            );
        }

        // Check whether token has expired
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "This reset link has expired."
            );
        }

        // Check passwords
        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new RuntimeException(
                    "Passwords do not match."
            );
        }

        User user = resetToken.getUser();

        // Hash the new password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        userRepository.save(user);

        // Make token unusable
        resetToken.setUsed(true);

        passwordResetTokenRepository.save(resetToken);
    }
}
