package com.securekyc.securekyc_backend.dto.application;

public class DecisionRequest {

    /** One of: APPROVE, REJECT, REQUEST_INFO, ESCALATE */
    private String decision;
    private String notes;

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
