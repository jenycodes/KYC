package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.VerificationCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationCheckRepository extends JpaRepository<VerificationCheck, Long> {
    List<VerificationCheck> findByApplication(KycApplication application);

    Optional<VerificationCheck> findByApplicationAndCheckType(
            KycApplication application, VerificationCheck.CheckType checkType);
}
