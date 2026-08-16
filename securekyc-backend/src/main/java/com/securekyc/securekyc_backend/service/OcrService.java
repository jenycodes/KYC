package com.securekyc.securekyc_backend.service;

import com.securekyc.securekyc_backend.service.ocr.HeuristicFieldParser;
import com.securekyc.securekyc_backend.service.ocr.MrzParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Runs the real Tesseract OCR engine (invoked as an external process — no JNA
 * binding, so there's no native-library version to keep in lockstep with the
 * installed binary) against an uploaded ID image, then attempts to turn the
 * recognized text into structured KYC fields: precisely via the passport MRZ
 * when present, or via best-effort heuristics otherwise.
 */
@Service
public class OcrService {

    private static final Logger log = LoggerFactory.getLogger(OcrService.class);

    private final String tesseractPath;
    private final boolean enabled;

    public OcrService(@Value("${app.ocr.tesseract-path}") String tesseractPath) {
        this.tesseractPath = tesseractPath;
        this.enabled = tesseractPath != null && !tesseractPath.isBlank();
    }

    /** Extracts whatever structured fields can be recognized from the given ID image. Never throws. */
    public Map<String, String> extractFields(Path imagePath) {
        if (!enabled) {
            return Map.of();
        }

        String text = extractRawText(imagePath);
        if (text.isBlank()) {
            return Map.of();
        }

        Map<String, String> mrzFields = MrzParser.tryParse(text);
        if (!mrzFields.isEmpty()) {
            return mrzFields;
        }

        return HeuristicFieldParser.parse(text);
    }

    private String extractRawText(Path imagePath) {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    tesseractPath, imagePath.toString(), "stdout", "--psm", "6"
            );
            builder.redirectErrorStream(false);
            Process process = builder.start();

            String output = readAll(process.getInputStream());
            boolean finished = process.waitFor(20, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("OCR timed out for {}", imagePath);
                return "";
            }

            return output;
        } catch (Exception e) {
            log.warn("OCR failed for {}: {}", imagePath, e.getMessage());
            return "";
        }
    }

    private String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        in.transferTo(buffer);
        return buffer.toString(StandardCharsets.UTF_8);
    }
}
