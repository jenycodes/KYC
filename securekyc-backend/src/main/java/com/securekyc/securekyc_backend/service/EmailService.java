package com.securekyc.securekyc_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${SMTP_FROM:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // ==========================================
    // SEND PASSWORD RESET EMAIL
    // ==========================================

    public void sendPasswordResetEmail(String to, String token) {

        String resetLink =
                "http://localhost:5173/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();

        if (!fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(to);
        message.setSubject("Secure KYC - Password Reset");

        message.setText(
                "Hello,\n\n" +
                "We received a request to reset your Secure KYC password.\n\n" +
                "Click the link below to reset your password:\n\n" +
                resetLink +
                "\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you did not request a password reset, " +
                "you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Secure KYC"
        );

        mailSender.send(message);
    }

    // ==========================================
    // SEND GENERIC NOTIFICATION EMAIL
    // ==========================================

    public void sendNotificationEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();

        if (!fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body + "\n\nRegards,\nSecure KYC");

        mailSender.send(message);
    }
}
