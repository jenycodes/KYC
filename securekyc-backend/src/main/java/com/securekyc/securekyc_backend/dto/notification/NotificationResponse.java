package com.securekyc.securekyc_backend.dto.notification;

public class NotificationResponse {

    private Long id;
    private String type;
    private String message;
    private Long applicationId;
    private boolean read;
    private String createdAt;

    public NotificationResponse(Long id, String type, String message, Long applicationId,
                                 boolean read, String createdAt) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.applicationId = applicationId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public boolean isRead() {
        return read;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
