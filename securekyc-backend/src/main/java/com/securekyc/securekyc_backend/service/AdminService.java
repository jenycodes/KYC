package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.dto.admin.AdminStatsResponse;
import com.securekyc.securekyc_backend.dto.admin.OfficerWorkloadResponse;
import com.securekyc.securekyc_backend.dto.admin.UserSummaryResponse;
import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.User;
import com.securekyc.securekyc_backend.exception.ApiException;
import com.securekyc.securekyc_backend.repository.KycApplicationRepository;
import com.securekyc.securekyc_backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final KycApplicationRepository applicationRepository;
    private final AssignmentService assignmentService;

    public AdminService(
            UserRepository userRepository,
            KycApplicationRepository applicationRepository,
            AssignmentService assignmentService) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.assignmentService = assignmentService;
    }

    public List<OfficerWorkloadResponse> listOfficers() {
        return userRepository.findByRole(User.Role.OFFICER).stream()
                .map(o -> new OfficerWorkloadResponse(
                        o.getId(), o.getFullName(), o.getEmail(), o.getEmployeeId(),
                        o.isActive(), assignmentService.activeLoad(o)))
                .toList();
    }

    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryResponse(
                        u.getId(), u.getFullName(), u.getEmail(), u.getEmployeeId(),
                        u.getRole().name(), u.isActive()))
                .toList();
    }

    public void setUserActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        if (user.getRole() == User.Role.ADMIN && !active) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin accounts cannot be deactivated.");
        }

        user.setActive(active);
        if (!active) {
            // Deactivation takes effect immediately, not just on next login.
            user.setSessionId(null);
        }
        userRepository.save(user);
    }

    public AdminStatsResponse stats() {
        long totalCustomers = userRepository.findByRole(User.Role.CUSTOMER).size();
        long totalOfficers = userRepository.findByRole(User.Role.OFFICER).size();

        List<KycApplication> all = applicationRepository.findAll();
        long submitted = countByStatus(all, KycApplication.Status.SUBMITTED);
        long underReview = countByStatus(all, KycApplication.Status.UNDER_REVIEW);
        long infoRequired = countByStatus(all, KycApplication.Status.ADDITIONAL_INFO_REQUIRED);
        long approved = countByStatus(all, KycApplication.Status.APPROVED);
        long rejected = countByStatus(all, KycApplication.Status.REJECTED);
        long escalated = countByStatus(all, KycApplication.Status.ESCALATED);

        return new AdminStatsResponse(totalCustomers, totalOfficers, all.size(),
                submitted, underReview, infoRequired, approved, rejected, escalated);
    }

    private long countByStatus(List<KycApplication> all, KycApplication.Status status) {
        return all.stream().filter(a -> a.getStatus() == status).count();
    }
}
