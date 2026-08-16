package com.securekyc.securekyc_backend.dto.application;

import java.util.Map;

public class DocumentUploadResponse {

    private DocumentResponse document;
    private Map<String, String> extractedFields;

    public DocumentUploadResponse(DocumentResponse document, Map<String, String> extractedFields) {
        this.document = document;
        this.extractedFields = extractedFields;
    }

    public DocumentResponse getDocument() {
        return document;
    }

    public Map<String, String> getExtractedFields() {
        return extractedFields;
    }
}
