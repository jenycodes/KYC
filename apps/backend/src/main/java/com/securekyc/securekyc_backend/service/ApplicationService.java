package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.dto.application.ApplicationRequest;
import com.securekyc.securekyc_backend.dto.application.DecisionRequest;
import com.securekyc.securekyc_backend.dto.application.VerificationCheckRequest;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.KycDocument;
import com.securekyc.securekyc_backend.entity.Notification;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.entity.VerificationCheck;
import com.securekyc.securekyc_backend.entity.VerificationStatus;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.KycApplicationRepository;
import com.securekyc.securekyc_backend.repository.KycDocumentRepository;
import com.securekyc.securekyc_backend.repository.VerificationCheckRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final KycApplicationRepository applicationRepository;
    private final KycDocumentRepository documentRepository;
    private final VerificationCheckRepository verificationCheckRepository;
    private final FileStorageService fileStorageService;
    private final AssignmentService assignmentService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final OcrService ocrService;

    public ApplicationService(
            KycApplicationRepository applicationRepository,
            KycDocumentRepository documentRepository,
            VerificationCheckRepository verificationCheckRepository,
            FileStorageService fileStorageService,
            AssignmentService assignmentService,
            AuditService auditService,
            NotificationService notificationService,
            OcrService ocrService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.verificationCheckRepository = verificationCheckRepository;
        this.fileStorageService = fileStorageService;
        this.assignmentService = assignmentService;
        this.auditService = auditService;
        this.ocrService = ocrService;
        this.notificationService = notificationService;
    }

    // =========================
    // ACCESS CONTROL
    // =========================

    /**
     * The single choke point for "can this user see this application" —
     * enforced here regardless of what the UI does or doesn't show, per the
     * requirement that authorization never rely only on hiding buttons.
     */
    public KycApplication getAccessible(Long id, User requester) {
        KycApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found."));

        boolean isOwner = application.getCustomer().getId().equals(requester.getId());
        boolean isAssignedOfficer = application.getAssignedOfficer() != null
                && application.getAssignedOfficer().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAssignedOfficer && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You don't have permission to access this application.");
        }

        return application;
    }

    private KycApplication getOwned(Long id, User customer) {
        KycApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found."));

        if (!application.getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You don't have permission to modify this application.");
        }
        return application;
    }

    private KycApplication getAssignedOrAdmin(Long id, User officerOrAdmin) {
        KycApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found."));

        boolean isAssignedOfficer = application.getAssignedOfficer() != null
                && application.getAssignedOfficer().getId().equals(officerOrAdmin.getId());
        boolean isAdmin = officerOrAdmin.getRole() == User.Role.ADMIN;

        if (!isAssignedOfficer && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This application is not assigned to you.");
        }
        return application;
    }

    // =========================
    // CUSTOMER: DRAFT / SUBMIT / RESUBMIT
    // =========================

    public KycApplication createDraft(User customer, ApplicationRequest request) {
        KycApplication application = new KycApplication();
        application.setCustomer(customer);
        applyFields(application, request);
        return applicationRepository.save(application);
    }

    public KycApplication updateDraft(Long id, User customer, ApplicationRequest request) {
        KycApplication application = getOwned(id, customer);

        if (application.getStatus() != KycApplication.Status.DRAFT
                && application.getStatus() != KycApplication.Status.ADDITIONAL_INFO_REQUIRED) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "This application can no longer be edited in its current state.");
        }

        applyFields(application, request);
        application.setUpdatedAt(LocalDateTime.now());
        return applicationRepository.save(application);
    }

    private void applyFields(KycApplication application, ApplicationRequest request) {
        application.setFullName(request.getFullName());
        application.setGender(request.getGender());
        application.setNationality(request.getNationality());
        application.setContactNumber(request.getContactNumber());
        application.setResidentialAddress(request.getResidentialAddress());
        application.setPermanentAddress(request.getPermanentAddress());
        application.setIdType(request.getIdType());
        application.setIdNumber(request.getIdNumber());
        application.setDateOfBirth(parseDate(request.getDateOfBirth()));
        application.setIdExpiryDate(parseDate(request.getIdExpiryDate()));
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid date format, expected yyyy-MM-dd.");
        }
    }

    public KycApplication submit(Long id, User customer) {
        KycApplication application = getOwned(id, customer);

        boolean wasCorrection = application.getStatus() == KycApplication.Status.ADDITIONAL_INFO_REQUIRED;

        if (application.getStatus() != KycApplication.Status.DRAFT && !wasCorrection) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This application has already been submitted.");
        }

        String previousStatus = application.getStatus().name();
        application.setSubmittedAt(LocalDateTime.now());
        application.setCorrectionReason(null);

        Optional<User> officer = assignmentService.pickOfficer();
        if (officer.isPresent()) {
            application.setAssignedOfficer(officer.get());
            application.setStatus(KycApplication.Status.UNDER_REVIEW);
        } else {
            application.setStatus(KycApplication.Status.SUBMITTED);
        }

        applicationRepository.save(application);

        auditService.record(customer, wasCorrection ? "resubmitted" : "submitted", application,
                previousStatus, application.getStatus().name(),
                wasCorrection ? "Customer resubmitted the application" : "Customer submitted the application");

        notificationService.notify(customer,
                wasCorrection ? Notification.Type.RESUBMITTED : Notification.Type.APPLICATION_SUBMITTED,
                wasCorrection
                        ? "Your resubmitted KYC application has been received."
                        : "Your KYC application has been submitted and is awaiting review.",
                application);

        officer.ifPresent(o -> notificationService.notify(o, Notification.Type.ASSIGNED,
                "A new KYC application from " + customer.getFullName() + " has been assigned to you.",
                application));

        return application;
    }

    // =========================
    // LISTING
    // =========================

    public List<KycApplication> listMine(User customer) {
        return applicationRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    public List<KycApplication> listAssigned(User officer) {
        return applicationRepository.findByAssignedOfficerOrderByCreatedAtDesc(officer);
    }

    public List<KycApplication> listAll() {
        return applicationRepository.findAllByOrderByCreatedAtDesc();
    }

    // =========================
    // DOCUMENTS
    // =========================

    private static final java.util.Set<KycDocument.DocumentType> OCR_ELIGIBLE_TYPES = java.util.Set.of(
            KycDocument.DocumentType.GOVERNMENT_ID, KycDocument.DocumentType.PASSPORT
    );

    public UploadOutcome uploadDocument(Long applicationId, User customer, String documentTypeRaw, MultipartFile file) {
        KycApplication application = getOwned(applicationId, customer);

        if (application.getStatus() != KycApplication.Status.DRAFT
                && application.getStatus() != KycApplication.Status.ADDITIONAL_INFO_REQUIRED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Documents can only be uploaded while the application is editable.");
        }

        KycDocument.DocumentType documentType = parseDocumentType(documentTypeRaw);

        List<KycDocument> existing = documentRepository
                .findByApplicationAndDocumentTypeOrderByVersionDesc(application, documentType);
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersion() + 1;

        String storedPath = fileStorageService.store(applicationId, documentType.name(), nextVersion, file);

        KycDocument document = new KycDocument();
        document.setApplication(application);
        document.setDocumentType(documentType);
        document.setFileName(file.getOriginalFilename());
        document.setStoredPath(storedPath);
        document.setFileSize(file.getSize());
        document.setContentType(file.getContentType());
        document.setUploadedBy(customer);
        document.setVersion(nextVersion);

        document = documentRepository.save(document);

        java.util.Map<String, String> extractedFields = java.util.Map.of();
        boolean isImage = file.getContentType() != null && file.getContentType().startsWith("image/");
        if (OCR_ELIGIBLE_TYPES.contains(documentType) && isImage) {
            extractedFields = ocrService.extractFields(fileStorageService.resolve(storedPath));
        }

        return new UploadOutcome(document, extractedFields);
    }

    public record UploadOutcome(KycDocument document, java.util.Map<String, String> extractedFields) {
    }

    private KycDocument.DocumentType parseDocumentType(String raw) {
        try {
            return KycDocument.DocumentType.valueOf(raw.toUpperCase());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown document type.");
        }
    }

    public List<KycDocument> listDocuments(KycApplication application) {
        return documentRepository.findByApplicationOrderByDocumentTypeAscVersionDesc(application);
    }

    public byte[] readDocumentContent(Long applicationId, Long documentId, User requester) {
        KycApplication application = getAccessible(applicationId, requester);
        KycDocument document = documentRepository.findById(documentId)
                .filter(d -> d.getApplication().getId().equals(application.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
        return fileStorageService.read(document.getStoredPath());
    }

    public KycDocument getDocument(Long applicationId, Long documentId, User requester) {
        KycApplication application = getAccessible(applicationId, requester);
        return documentRepository.findById(documentId)
                .filter(d -> d.getApplication().getId().equals(application.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
    }

    // =========================
    // OFFICER: VERIFICATION CHECKS
    // =========================

    public VerificationCheck recordCheck(Long applicationId, User officer, VerificationCheckRequest request) {
        KycApplication application = getAssignedOrAdmin(applicationId, officer);

        VerificationCheck.CheckType checkType;
        VerificationStatus status;
        try {
            checkType = VerificationCheck.CheckType.valueOf(request.getCheckType().toUpperCase());
            status = VerificationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid check type or status.");
        }

        VerificationCheck check = verificationCheckRepository
                .findByApplicationAndCheckType(application, checkType)
                .orElseGet(VerificationCheck::new);

        check.setApplication(application);
        check.setCheckType(checkType);
        check.setStatus(status);
        check.setRemarks(request.getRemarks());
        check.setCheckedBy(officer);
        check.setCheckedAt(LocalDateTime.now());

        return verificationCheckRepository.save(check);
    }

    public List<VerificationCheck> listChecks(KycApplication application) {
        return verificationCheckRepository.findByApplication(application);
    }

    // =========================
    // OFFICER: DECISION
    // =========================

    public KycApplication decide(Long applicationId, User officer, DecisionRequest request) {
        KycApplication application = getAssignedOrAdmin(applicationId, officer);

        if (application.getStatus() != KycApplication.Status.UNDER_REVIEW) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This application is not currently under review.");
        }

        String previousStatus = application.getStatus().name();
        String decision = request.getDecision() == null ? "" : request.getDecision().toUpperCase();

        Notification.Type notificationType;
        String customerMessage;
        String auditAction;

        switch (decision) {
            case "APPROVE" -> {
                application.setStatus(KycApplication.Status.APPROVED);
                application.setDecidedAt(LocalDateTime.now());
                notificationType = Notification.Type.APPROVED;
                customerMessage = "Your KYC application has been approved.";
                auditAction = "approved";
            }
            case "REJECT" -> {
                application.setStatus(KycApplication.Status.REJECTED);
                application.setDecidedAt(LocalDateTime.now());
                notificationType = Notification.Type.REJECTED;
                customerMessage = "Your KYC application has been rejected.";
                auditAction = "rejected";
            }
            case "REQUEST_INFO" -> {
                application.setStatus(KycApplication.Status.ADDITIONAL_INFO_REQUIRED);
                application.setCorrectionReason(request.getNotes());
                notificationType = Notification.Type.ADDITIONAL_INFO_REQUIRED;
                customerMessage = "Additional information is required for your KYC application: " + request.getNotes();
                auditAction = "requested additional information";
            }
            case "ESCALATE" -> {
                application.setStatus(KycApplication.Status.ESCALATED);
                notificationType = Notification.Type.ESCALATED;
                customerMessage = "Your KYC application has been escalated for further review.";
                auditAction = "escalated";
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid decision.");
        }

        applicationRepository.save(application);

        auditService.record(officer, auditAction, application, previousStatus,
                application.getStatus().name(), request.getNotes());

        notificationService.notify(application.getCustomer(), notificationType, customerMessage, application);

        return application;
    }

    // =========================
    // ADMIN: REASSIGN
    // =========================

    public KycApplication reassign(Long applicationId, User admin, User newOfficer) {
        KycApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found."));

        User previousOfficer = application.getAssignedOfficer();
        application.setAssignedOfficer(newOfficer);
        if (application.getStatus() == KycApplication.Status.SUBMITTED) {
            application.setStatus(KycApplication.Status.UNDER_REVIEW);
        }
        applicationRepository.save(application);

        auditService.record(admin, "reassigned", application,
                previousOfficer == null ? "unassigned" : previousOfficer.getEmail(),
                newOfficer.getEmail(), "Reassigned by admin");

        notificationService.notify(newOfficer, Notification.Type.REASSIGNED,
                "An application from " + application.getCustomer().getFullName() + " has been assigned to you.",
                application);

        return application;
    }
}
