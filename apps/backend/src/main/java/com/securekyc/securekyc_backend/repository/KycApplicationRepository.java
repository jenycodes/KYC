package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KycApplicationRepository extends JpaRepository<KycApplication, Long> {
    List<KycApplication> findByCustomerOrderByCreatedAtDesc(User customer);

    List<KycApplication> findByAssignedOfficerOrderByCreatedAtDesc(User officer);

    List<KycApplication> findAllByOrderByCreatedAtDesc();

    long countByAssignedOfficerAndStatus(User officer, KycApplication.Status status);
}
