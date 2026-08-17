package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(Long userId); // This lets us remove an old reset token before creating a new one.
}