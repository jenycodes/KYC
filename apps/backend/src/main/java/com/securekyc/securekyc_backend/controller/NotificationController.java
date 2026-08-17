package com.securekyc.securekyc_backend.controller;

import com.securekyc.securekyc_backend.dto.notification.NotificationResponse;
import com.securekyc.securekyc_backend.entity.Notification;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.NotificationRepository;
import com.securekyc.securekyc_backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
    }

    @GetMapping
    public ResponseEntity<?> mine(Authentication authentication) {
        User user = currentUser(authentication);
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications.stream().map(this::toResponse).toList());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(Authentication authentication, @PathVariable Long id) {
        User user = currentUser(authentication);
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getRecipient().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found."));

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        User user = currentUser(authentication);
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType().name(),
                notification.getMessage(),
                notification.getApplication() == null ? null : notification.getApplication().getId(),
                notification.isRead(),
                notification.getCreatedAt().toString()
        );
    }
}
