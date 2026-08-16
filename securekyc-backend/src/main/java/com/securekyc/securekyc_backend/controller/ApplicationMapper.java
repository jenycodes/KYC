package com.securekyc.securekyc_backend.controller;

import com.securekyc.securekyc_backend.dto.application.ApplicationResponse;
import com.securekyc.securekyc_backend.dto.application.DocumentResponse;
import com.securekyc.securekyc_backend.dto.application.VerificationCheckResponse;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.KycDocument;
import com.securekyc.securekyc_backend.entity.VerificationCheck;

import java.util.List;

final class ApplicationMapper {

    private ApplicationMapper() {
    }

    static ApplicationResponse toResponse(KycApplication app, List<KycDocument> documents,
                                           List<VerificationCheck> checks) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(app.getId());
        response.setStatus(app.getStatus().name());

        response.setCustomerName(app.getCustomer().getFullName());
        response.setCustomerEmail(app.getCustomer().getEmail());
        if (app.getAssignedOfficer() != null) {
            response.setAssignedOfficerName(app.getAssignedOfficer().getFullName());
            response.setAssignedOfficerEmail(app.getAssignedOfficer().getEmail());
        }

        response.setFullName(app.getFullName());
        response.setDateOfBirth(str(app.getDateOfBirth()));
        response.setGender(app.getGender());
        response.setNationality(app.getNationality());
        response.setContactNumber(app.getContactNumber());
        response.setResidentialAddress(app.getResidentialAddress());
        response.setPermanentAddress(app.getPermanentAddress());
        response.setIdType(app.getIdType());
        response.setIdNumber(app.getIdNumber());
        response.setIdExpiryDate(str(app.getIdExpiryDate()));

        response.setCorrectionReason(app.getCorrectionReason());
        response.setCreatedAt(str(app.getCreatedAt()));
        response.setSubmittedAt(str(app.getSubmittedAt()));
        response.setDecidedAt(str(app.getDecidedAt()));

        response.setDocuments(documents.stream()
                .map(ApplicationMapper::toDocumentResponse)
                .toList());
        response.setVerificationChecks(checks.stream()
                .map(ApplicationMapper::toCheckResponse)
                .toList());

        return response;
    }

    static DocumentResponse toDocumentResponse(KycDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getDocumentType().name(),
                document.getFileName(),
                document.getFileSize(),
                document.getContentType(),
                document.getVersion(),
                document.getVerificationStatus().name(),
                document.getRemarks(),
                str(document.getUploadedAt())
        );
    }

    static VerificationCheckResponse toCheckResponse(VerificationCheck check) {
        return new VerificationCheckResponse(
                check.getId(),
                check.getCheckType().name(),
                check.getStatus().name(),
                check.getRemarks(),
                check.getCheckedBy() == null ? null : check.getCheckedBy().getFullName(),
                str(check.getCheckedAt())
        );
    }

    private static String str(Object value) {
        return value == null ? null : value.toString();
    }
}
