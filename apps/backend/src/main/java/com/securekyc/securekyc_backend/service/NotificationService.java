package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.Notification;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.NotificationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    /** Persists an in-app notification and best-effort sends a matching email. Never throws. */
    public void notify(User recipient, Notification.Type type, String message, KycApplication application) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setApplication(application);
        notificationRepository.save(notification);

        try {
            emailService.sendNotificationEmail(recipient.getEmail(), subjectFor(type), message);
        } catch (RuntimeException e) {
            // A failed email must never break the underlying application workflow —
            // the in-app notification above already recorded the event.
            log.warn("Failed to send notification email to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    private String subjectFor(Notification.Type type) {
        return switch (type) {
            case APPLICATION_SUBMITTED -> "Secure KYC - Application submitted";
            case MOVED_TO_REVIEW -> "Secure KYC - Application under review";
            case ADDITIONAL_INFO_REQUIRED -> "Secure KYC - Additional information required";
            case APPROVED -> "Secure KYC - Application approved";
            case REJECTED -> "Secure KYC - Application rejected";
            case ASSIGNED -> "Secure KYC - New application assigned to you";
            case REASSIGNED -> "Secure KYC - Application reassigned";
            case RESUBMITTED -> "Secure KYC - Application resubmitted";
            case ESCALATED -> "Secure KYC - Application escalated";
            case WORKLOAD_THRESHOLD -> "Secure KYC - Workload threshold exceeded";
        };
    }
}
