package com.securekyc.securekyc_backend.dto.admin;

public class OfficerWorkloadResponse {

    private Long id;
    private String fullName;
    private String email;
    private String employeeId;
    private boolean active;
    private long activeCaseCount;

    public OfficerWorkloadResponse(Long id, String fullName, String email, String employeeId,
                                    boolean active, long activeCaseCount) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.active = active;
        this.activeCaseCount = activeCaseCount;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public boolean isActive() {
        return active;
    }

    public long getActiveCaseCount() {
        return activeCaseCount;
    }
}
