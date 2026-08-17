package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.entity.AuditLogEntry;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.AuditLogEntryRepository;

import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogEntryRepository auditLogEntryRepository;

    public AuditService(AuditLogEntryRepository auditLogEntryRepository) {
        this.auditLogEntryRepository = auditLogEntryRepository;
    }

    public void record(User actor, String action, KycApplication application,
                        String previousStatus, String newStatus, String detail) {

        AuditLogEntry entry = new AuditLogEntry();
        entry.setActor(actor);
        entry.setActorRole(actor.getRole().name());
        entry.setAction(action);
        entry.setApplication(application);
        entry.setPreviousStatus(previousStatus);
        entry.setNewStatus(newStatus);
        entry.setDetail(detail);

        auditLogEntryRepository.save(entry);
    }
}
