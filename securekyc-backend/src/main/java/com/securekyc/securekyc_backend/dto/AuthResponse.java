package com.securekyc.securekyc_backend.dto;

public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private String employeeId;
    private String role;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String fullName, String email,
                        String employeeId, String role, String token) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.role = role;
        this.token = token;
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

    public String getToken() {
        return token;
    }
}