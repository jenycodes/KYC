package com.securekyc.securekyc_backend.controller;

import com.securekyc.securekyc_backend.dto.admin.AuditLogResponse;
import com.securekyc.securekyc_backend.dto.admin.ReassignRequest;
import com.securekyc.securekyc_backend.entity.AuditLogEntry;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.AuditLogEntryRepository;
import com.securekyc.securekyc_backend.repository.UserRepository;
import com.securekyc.securekyc_backend.service.AdminService;
import com.securekyc.securekyc_backend.service.ApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final AuditLogEntryRepository auditLogEntryRepository;

    public AdminController(
            AdminService adminService,
            ApplicationService applicationService,
            UserRepository userRepository,
            AuditLogEntryRepository auditLogEntryRepository) {
        this.adminService = adminService;
        this.applicationService = applicationService;
        this.userRepository = userRepository;
        this.auditLogEntryRepository = auditLogEntryRepository;
    }

    @GetMapping("/officers")
    public ResponseEntity<?> officers() {
        return ResponseEntity.ok(adminService.listOfficers());
    }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        adminService.setUserActive(id, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        adminService.setUserActive(id, false);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/applications")
    public ResponseEntity<?> applications() {
        List<KycApplication> all = applicationService.listAll();
        return ResponseEntity.ok(all.stream()
                .map(a -> ApplicationMapper.toResponse(a, List.of(), List.of()))
                .toList());
    }

    @PostMapping("/applications/{id}/reassign")
    public ResponseEntity<?> reassign(
            Authentication authentication, @PathVariable Long id, @RequestBody ReassignRequest request) {

        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));

        User officer = userRepository.findById(request.getOfficerId())
                .filter(u -> u.getRole() == User.Role.OFFICER)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Officer not found."));

        KycApplication application = applicationService.reassign(id, admin, officer);
        return ResponseEntity.ok(ApplicationMapper.toResponse(application, List.of(), List.of()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(adminService.stats());
    }

    @GetMapping("/audit-log")
    public ResponseEntity<?> auditLog() {
        List<AuditLogEntry> entries = auditLogEntryRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(entries.stream().map(this::toAuditResponse).toList());
    }

    private AuditLogResponse toAuditResponse(AuditLogEntry entry) {
        return new AuditLogResponse(
                entry.getId(),
                entry.getActor() == null ? "System" : entry.getActor().getFullName(),
                entry.getActorRole(),
                entry.getAction(),
                entry.getApplication() == null ? null : entry.getApplication().getId(),
                entry.getPreviousStatus(),
                entry.getNewStatus(),
                entry.getDetail(),
                entry.getCreatedAt().toString()
        );
    }
}
