package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.KycApplication;
import com.securekyc.securekyc_backend.entity.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {
    List<KycDocument> findByApplicationOrderByDocumentTypeAscVersionDesc(KycApplication application);

    List<KycDocument> findByApplicationAndDocumentTypeOrderByVersionDesc(
            KycApplication application, KycDocument.DocumentType documentType);
}
