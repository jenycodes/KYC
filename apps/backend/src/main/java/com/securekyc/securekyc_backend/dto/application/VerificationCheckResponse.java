package com.securekyc.securekyc_backend.dto.application;

public class VerificationCheckResponse {

    private Long id;
    private String checkType;
    private String status;
    private String remarks;
    private String checkedBy;
    private String checkedAt;

    public VerificationCheckResponse(Long id, String checkType, String status,
                                      String remarks, String checkedBy, String checkedAt) {
        this.id = id;
        this.checkType = checkType;
        this.status = status;
        this.remarks = remarks;
        this.checkedBy = checkedBy;
        this.checkedAt = checkedAt;
    }

    public Long getId() {
        return id;
    }

    public String getCheckType() {
        return checkType;
    }

    public String getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getCheckedBy() {
        return checkedBy;
    }

    public String getCheckedAt() {
        return checkedAt;
    }
}
