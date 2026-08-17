package com.securekyc.securekyc_backend.config;

import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedEmail;
    private final String seedPassword;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.seed.email}") String seedEmail,
            @Value("${admin.seed.password}") String seedPassword) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (seedEmail == null || seedEmail.isBlank() || seedPassword == null || seedPassword.isBlank()) {
            return;
        }

        if (userRepository.existsByEmail(seedEmail)) {
            return;
        }

        User admin = new User();
        admin.setFullName("Admin");
        admin.setEmail(seedEmail);
        admin.setPassword(passwordEncoder.encode(seedPassword));
        admin.setRole(User.Role.ADMIN);

        userRepository.save(admin);
        log.info("Seeded admin account for {}", seedEmail);
    }
}
