package com.securekyc.securekyc_backend.dto.admin;

public class UserSummaryResponse {

    private Long id;
    private String fullName;
    private String email;
    private String employeeId;
    private String role;
    private boolean active;

    public UserSummaryResponse(Long id, String fullName, String email, String employeeId,
                               String role, boolean active) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.role = role;
        this.active = active;
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

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}
