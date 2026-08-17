package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.AuditLogEntry;
import com.securekyc.securekyc_backend.entity.KycApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogEntryRepository extends JpaRepository<AuditLogEntry, Long> {
    List<AuditLogEntry> findAllByOrderByCreatedAtDesc();

    List<AuditLogEntry> findByApplicationOrderByCreatedAtDesc(KycApplication application);
}
