package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.exception.ApiException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf"
    );

    private final Path uploadsRoot;

    public FileStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.uploadsRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadsRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create uploads directory: " + uploadsRoot, e);
        }
    }

    /** Validates and persists an uploaded file, returning its path relative to the uploads root. */
    public String store(Long applicationId, String documentType, int version, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No file was provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File exceeds the 10MB size limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, or PDF files are accepted.");
        }

        String extension = switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            default -> ".pdf";
        };

        Path applicationDir = uploadsRoot.resolve(String.valueOf(applicationId)).normalize();
        if (!applicationDir.startsWith(uploadsRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid application reference.");
        }

        try {
            Files.createDirectories(applicationDir);
            String storedFileName = documentType + "-v" + version + "-" + UUID.randomUUID() + extension;
            Path target = applicationDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return uploadsRoot.relativize(target).toString();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store the uploaded file.");
        }
    }

    public byte[] read(String relativePath) {
        Path target = resolve(relativePath);
        try {
            return Files.readAllBytes(target);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "The requested file could not be found.");
        }
    }

    /** Absolute on-disk path for a previously stored file — used by OCR, which needs a real file path. */
    public Path resolve(String relativePath) {
        Path target = uploadsRoot.resolve(relativePath).normalize();
        if (!target.startsWith(uploadsRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid file reference.");
        }
        return target;
    }
}
