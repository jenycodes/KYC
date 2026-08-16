package com.securekyc.securekyc_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Identifies the single currently-active session for this account. Every
    // login/register mints a new value here, which immediately invalidates
    // any token issued for a previous session (see JwtAuthenticationFilter).
    @JsonIgnore
    @Column(name = "session_id")
    private String sessionId;

    @Column(nullable = false)
    private boolean active = true;

    public enum Role {
        CUSTOMER,
        OFFICER,
        ADMIN
    }

    // Default constructor required by JPA
    public User() {
    }

    // Constructor for creating a user
    public User(String fullName, String email, String employeeId,
                String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.password = password;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}