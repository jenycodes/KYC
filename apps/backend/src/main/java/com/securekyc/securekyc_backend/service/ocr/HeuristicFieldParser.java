package com.securekyc.securekyc_backend.service.ocr;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Best-effort field extraction for ID documents that don't carry a Machine
 * Readable Zone (national ID cards, driving licences, etc). Unlike
 * {@link MrzParser}, this is genuinely heuristic — free-text OCR output has
 * no fixed layout to rely on — so results are meant to pre-fill the review
 * form for the customer to confirm or correct, not to be treated as final.
 */
public final class HeuristicFieldParser {

    private static final Pattern DATE_SLASH = Pattern.compile("\\b(\\d{1,2})[/.\\-](\\d{1,2})[/.\\-](\\d{2,4})\\b");
    private static final Pattern DATE_ISO = Pattern.compile("\\b(\\d{4})-(\\d{1,2})-(\\d{1,2})\\b");
    private static final Pattern ID_NUMBER = Pattern.compile("\\b(?=[A-Z0-9]{6,15}\\b)(?=[A-Z0-9]*[0-9])[A-Z][A-Z0-9]{5,14}\\b");
    private static final Set<String> IGNORED_NAME_WORDS = Set.of(
            "REPUBLIC", "GOVERNMENT", "IDENTITY", "CARD", "NATIONAL", "PASSPORT",
            "LICENCE", "LICENSE", "DRIVING", "PERMIT", "AUTHORITY", "DEPARTMENT"
    );

    private HeuristicFieldParser() {
    }

    public static Map<String, String> parse(String rawText) {
        Map<String, String> fields = new HashMap<>();
        String upper = rawText.toUpperCase();

        List<LocalDate> dates = extractDates(rawText);
        dates.sort(LocalDate::compareTo);
        if (!dates.isEmpty()) {
            // The earliest plausible date is treated as date of birth; a later
            // one (if present) as the document's expiry.
            fields.put("dateOfBirth", dates.get(0).toString());
            if (dates.size() > 1) {
                fields.put("idExpiryDate", dates.get(dates.size() - 1).toString());
            }
        }

        Matcher idMatcher = ID_NUMBER.matcher(upper);
        if (idMatcher.find()) {
            fields.put("idNumber", idMatcher.group());
        }

        String nameCandidate = bestNameLine(rawText);
        if (nameCandidate != null) {
            fields.put("fullName", nameCandidate);
        }

        return fields;
    }

    private static List<LocalDate> extractDates(String text) {
        List<LocalDate> dates = new ArrayList<>();

        Matcher slash = DATE_SLASH.matcher(text);
        while (slash.find()) {
            LocalDate d = tryDate(slash.group(1), slash.group(2), slash.group(3));
            if (d != null) dates.add(d);
        }

        Matcher iso = DATE_ISO.matcher(text);
        while (iso.find()) {
            try {
                dates.add(LocalDate.parse(iso.group(), DateTimeFormatter.ISO_LOCAL_DATE));
            } catch (DateTimeParseException ignored) {
                // skip malformed match
            }
        }

        return dates;
    }

    private static LocalDate tryDate(String d1, String d2, String yearStr) {
        try {
            int a = Integer.parseInt(d1);
            int b = Integer.parseInt(d2);
            int year = Integer.parseInt(yearStr);
            if (yearStr.length() == 2) {
                year += (year < 50) ? 2000 : 1900;
            }

            // Try day/month first (most of the world), then month/day (US-style)
            // as a fallback if the first interpretation is impossible.
            if (b >= 1 && b <= 12 && a >= 1 && a <= 31) {
                return LocalDate.of(year, b, a);
            }
            if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
                return LocalDate.of(year, a, b);
            }
        } catch (Exception ignored) {
            // fall through
        }
        return null;
    }

    private static String bestNameLine(String rawText) {
        String best = null;

        for (String line : rawText.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.length() < 4 || trimmed.length() > 40) continue;
            if (!trimmed.matches("[A-Za-z ,.'\\-]+")) continue;

            String upperLine = trimmed.toUpperCase();
            boolean isIgnored = IGNORED_NAME_WORDS.stream().anyMatch(upperLine::contains);
            boolean looksLikeName = trimmed.equals(upperLine) && trimmed.split("\\s+").length >= 2;

            if (looksLikeName && !isIgnored) {
                if (best == null || trimmed.length() > best.length()) {
                    best = trimmed;
                }
            }
        }

        return best == null ? null : titleCase(best);
    }

    private static String titleCase(String value) {
        StringBuilder result = new StringBuilder();
        for (String word : value.split("\\s+")) {
            if (word.isEmpty()) continue;
            if (!result.isEmpty()) result.append(' ');
            result.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1).toLowerCase());
        }
        return result.toString();
    }
}
