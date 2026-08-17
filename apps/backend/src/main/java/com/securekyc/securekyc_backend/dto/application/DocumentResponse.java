package com.securekyc.securekyc_backend.dto.application;

public class DocumentResponse {

    private Long id;
    private String documentType;
    private String fileName;
    private long fileSize;
    private String contentType;
    private int version;
    private String verificationStatus;
    private String remarks;
    private String uploadedAt;

    public DocumentResponse(Long id, String documentType, String fileName, long fileSize,
                             String contentType, int version, String verificationStatus,
                             String remarks, String uploadedAt) {
        this.id = id;
        this.documentType = documentType;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.version = version;
        this.verificationStatus = verificationStatus;
        this.remarks = remarks;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public long getFileSize() {
        return fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public int getVersion() {
        return version;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getUploadedAt() {
        return uploadedAt;
    }
}
