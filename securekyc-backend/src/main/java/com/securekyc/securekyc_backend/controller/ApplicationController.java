package com.securekyc.securekyc_backend.controller;

import com.securekyc.securekyc_backend.dto.application.ApplicationRequest;
import com.securekyc.securekyc_backend.dto.application.ApplicationResponse;
import com.securekyc.securekyc_backend.dto.application.DecisionRequest;
import com.securekyc.securekyc_backend.dto.application.DocumentUploadResponse;
import com.securekyc.securekyc_backend.dto.application.VerificationCheckRequest;
import com.securekyc.securekyc_backend.dto.application.VerificationCheckResponse;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.KycDocument;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.UserRepository;
import com.securekyc.securekyc_backend.service.ApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public ApplicationController(ApplicationService applicationService, UserRepository userRepository) {
        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createDraft(Authentication authentication, @RequestBody ApplicationRequest request) {
        KycApplication application = applicationService.createDraft(currentUser(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(application));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateDraft(
            Authentication authentication, @PathVariable Long id, @RequestBody ApplicationRequest request) {
        KycApplication application = applicationService.updateDraft(id, currentUser(authentication), request);
        return ResponseEntity.ok(toResponse(application));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> submit(Authentication authentication, @PathVariable Long id) {
        KycApplication application = applicationService.submit(id, currentUser(authentication));
        return ResponseEntity.ok(toResponse(application));
    }

    @PostMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> resubmit(Authentication authentication, @PathVariable Long id) {
        KycApplication application = applicationService.submit(id, currentUser(authentication));
        return ResponseEntity.ok(toResponse(application));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> mine(Authentication authentication) {
        List<KycApplication> applications = applicationService.listMine(currentUser(authentication));
        return ResponseEntity.ok(applications.stream().map(this::toSummary).toList());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<?> assigned(Authentication authentication) {
        User user = currentUser(authentication);
        List<KycApplication> applications = user.getRole() == User.Role.ADMIN
                ? applicationService.listAll()
                : applicationService.listAssigned(user);
        return ResponseEntity.ok(applications.stream().map(this::toSummary).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(Authentication authentication, @PathVariable Long id) {
        KycApplication application = applicationService.getAccessible(id, currentUser(authentication));
        return ResponseEntity.ok(toResponse(application));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> uploadDocument(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {

        ApplicationService.UploadOutcome outcome =
                applicationService.uploadDocument(id, currentUser(authentication), documentType, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(new DocumentUploadResponse(
                ApplicationMapper.toDocumentResponse(outcome.document()),
                outcome.extractedFields()
        ));
    }

    @GetMapping("/{id}/documents/{docId}/content")
    public ResponseEntity<byte[]> getDocumentContent(
            Authentication authentication, @PathVariable Long id, @PathVariable Long docId) {

        User user = currentUser(authentication);
        KycDocument document = applicationService.getDocument(id, docId, user);
        byte[] content = applicationService.readDocumentContent(id, docId, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .body(content);
    }

    @PostMapping("/{id}/verification-checks")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<?> recordCheck(
            Authentication authentication, @PathVariable Long id, @RequestBody VerificationCheckRequest request) {

        var check = applicationService.recordCheck(id, currentUser(authentication), request);
        return ResponseEntity.ok(ApplicationMapper.toCheckResponse(check));
    }

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<?> decide(
            Authentication authentication, @PathVariable Long id, @RequestBody DecisionRequest request) {

        KycApplication application = applicationService.decide(id, currentUser(authentication), request);
        return ResponseEntity.ok(toResponse(application));
    }

    private ApplicationResponse toResponse(KycApplication application) {
        List<KycDocument> documents = applicationService.listDocuments(application);
        var checks = applicationService.listChecks(application);
        return ApplicationMapper.toResponse(application, documents, checks);
    }

    /** Lighter payload for list views — documents/checks are fetched on the detail view only. */
    private ApplicationResponse toSummary(KycApplication application) {
        return ApplicationMapper.toResponse(application, List.of(), List.of());
    }
}
