package com.securekyc.securekyc_backend.dto.admin;

public class AuditLogResponse {

    private Long id;
    private String actorName;
    private String actorRole;
    private String action;
    private Long applicationId;
    private String previousStatus;
    private String newStatus;
    private String detail;
    private String createdAt;

    public AuditLogResponse(Long id, String actorName, String actorRole, String action,
                             Long applicationId, String previousStatus, String newStatus,
                             String detail, String createdAt) {
        this.id = id;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.action = action;
        this.applicationId = applicationId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.detail = detail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getActorName() {
        return actorName;
    }

    public String getActorRole() {
        return actorRole;
    }

    public String getAction() {
        return action;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public String getDetail() {
        return detail;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
