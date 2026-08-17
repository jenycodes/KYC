package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.repository.KycApplicationRepository;
import com.securekyc.securekyc_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {

    private final UserRepository userRepository;
    private final KycApplicationRepository applicationRepository;

    public AssignmentService(UserRepository userRepository, KycApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Picks the active Officer with the fewest currently-open (UNDER_REVIEW)
     * applications — real round-robin-by-load, not a fixed rotation. Returns
     * empty if there are no active Officers yet; the application is left
     * unassigned until one registers or an Admin assigns it manually.
     */
    public Optional<User> pickOfficer() {
        List<User> officers = userRepository.findByRoleAndActiveTrue(User.Role.OFFICER);

        return officers.stream()
                .min((a, b) -> Long.compare(activeLoad(a), activeLoad(b)));
    }

    public long activeLoad(User officer) {
        return applicationRepository.countByAssignedOfficerAndStatus(officer, KycApplication.Status.UNDER_REVIEW);
    }
}
