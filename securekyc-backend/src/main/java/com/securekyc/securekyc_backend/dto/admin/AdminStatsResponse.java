package com.securekyc.securekyc_backend.dto.admin;

public class AdminStatsResponse {

    private long totalCustomers;
    private long totalOfficers;
    private long totalApplications;
    private long submitted;
    private long underReview;
    private long additionalInfoRequired;
    private long approved;
    private long rejected;
    private long escalated;

    public AdminStatsResponse(long totalCustomers, long totalOfficers, long totalApplications,
                               long submitted, long underReview, long additionalInfoRequired,
                               long approved, long rejected, long escalated) {
        this.totalCustomers = totalCustomers;
        this.totalOfficers = totalOfficers;
        this.totalApplications = totalApplications;
        this.submitted = submitted;
        this.underReview = underReview;
        this.additionalInfoRequired = additionalInfoRequired;
        this.approved = approved;
        this.rejected = rejected;
        this.escalated = escalated;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public long getTotalOfficers() {
        return totalOfficers;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public long getSubmitted() {
        return submitted;
    }

    public long getUnderReview() {
        return underReview;
    }

    public long getAdditionalInfoRequired() {
        return additionalInfoRequired;
    }

    public long getApproved() {
        return approved;
    }

    public long getRejected() {
        return rejected;
    }

    public long getEscalated() {
        return escalated;
    }
}
