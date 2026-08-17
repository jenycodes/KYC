package com.securekyc.securekyc_backend.dto;

public class ForgotPasswordRequest {

    private String email;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

// when react sends the email to the backend, it will be in the form of a JSON object
//  and this class will be used to deserialize that JSON object into a Java object. The email field will hold the email address of the user who is requesting a password reset.