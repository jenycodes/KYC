package com.securekyc.securekyc_backend.service.ocr;

import java.time.LocalDate;
import java.time.Year;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses the ICAO 9303 Machine Readable Zone printed on passport bio pages
 * (TD3 format: two 44-character lines). This is deterministic where a real
 * passport is scanned under good conditions — the MRZ is printed in an
 * OCR-optimized font specifically for this purpose. Tolerant, regex-anchored
 * matching is used rather than strict fixed-width parsing, since Tesseract
 * commonly drops or substitutes a character or two in the padding zone even
 * when the meaningful data reads cleanly.
 */
public final class MrzParser {

    // Line 1: P<CCCSURNAME<<GIVEN<NAMES<<<... — anchor on "P<" + 3-letter country.
    private static final Pattern LINE1 = Pattern.compile("P[A-Z<][A-Z]{3}[A-Z<]{2,44}");
    // Line 2: DOCNUM(9)+CHECK+NATIONALITY(3)+DOB(6)+CHECK+SEX+EXPIRY(6)+CHECK — anchored, ignores the rest.
    private static final Pattern LINE2 = Pattern.compile(
            "([A-Z0-9<]{9})\\d([A-Z<]{3})(\\d{6})\\d([MF<])(\\d{6})\\d"
    );

    private MrzParser() {
    }

    public static Map<String, String> tryParse(String rawText) {
        String[] lines = rawText.replace("\r", "").split("\n");

        String line1 = null;
        String line2 = null;

        for (String rawLine : lines) {
            String candidate = normalize(rawLine);
            // Real MRZ lines are 44 characters; this rules out ordinary prose
            // (titles, labels) that might otherwise loosely match the patterns
            // below — a plain-text line is essentially never this long once
            // whitespace is stripped, an MRZ line always is.
            if (candidate.length() < 36) continue;

            if (line1 == null && LINE1.matcher(candidate).lookingAt()) {
                line1 = candidate;
                continue;
            }
            if (line2 == null && LINE2.matcher(candidate).find()) {
                line2 = candidate;
            }
        }

        if (line1 == null && line2 == null) {
            return Map.of();
        }

        Map<String, String> fields = new HashMap<>();
        fields.put("idType", "PASSPORT");

        if (line1 != null) {
            parseNameLine(line1, fields);
        }
        if (line2 != null) {
            parseDataLine(line2, fields);
        }

        return fields;
    }

    private static void parseNameLine(String line1, Map<String, String> fields) {
        try {
            // Skip "P<" + 3-letter country code, then read the name zone up to
            // where the padding starts (a run of 3+ non-letter filler chars).
            String afterCountry = line1.substring(5);
            Matcher nameZone = Pattern.compile("^([A-Z<]+?)(?:<{3,}|$)").matcher(afterCountry);
            String nameSection = nameZone.find() ? nameZone.group(1) : afterCountry;

            String[] nameParts = nameSection.split("<<", 2);
            String surname = nameParts[0].replace("<", " ").trim();
            String givenNames = nameParts.length > 1 ? nameParts[1].replace("<", " ").trim() : "";
            String fullName = (givenNames.isEmpty() ? surname : givenNames + " " + surname).trim();

            if (!fullName.isEmpty()) {
                fields.put("fullName", titleCase(fullName));
            }

            String nationalityGuess = line1.substring(2, 5).replace("<", "").trim();
            if (!nationalityGuess.isEmpty()) {
                fields.putIfAbsent("nationality", nationalityGuess);
            }
        } catch (Exception ignored) {
            // Leave whatever fields were already extracted.
        }
    }

    private static void parseDataLine(String line2, Map<String, String> fields) {
        Matcher m = LINE2.matcher(line2);
        if (!m.find()) return;

        String docNumber = m.group(1).replace("<", "").trim();
        if (!docNumber.isEmpty()) {
            fields.put("idNumber", docNumber);
        }

        String nationality = m.group(2).replace("<", "").trim();
        if (!nationality.isEmpty()) {
            fields.put("nationality", nationality);
        }

        LocalDate dob = parseMrzDate(m.group(3), true);
        if (dob != null) {
            fields.put("dateOfBirth", dob.toString());
        }

        String sex = m.group(4);
        if (sex.equals("M")) fields.put("gender", "Male");
        else if (sex.equals("F")) fields.put("gender", "Female");

        LocalDate expiry = parseMrzDate(m.group(5), false);
        if (expiry != null) {
            fields.put("idExpiryDate", expiry.toString());
        }
    }

    private static String normalize(String line) {
        return line.toUpperCase().replaceAll("[^A-Z0-9<]", "").trim();
    }

    private static LocalDate parseMrzDate(String yyMMdd, boolean isBirthDate) {
        try {
            int yy = Integer.parseInt(yyMMdd.substring(0, 2));
            int month = Integer.parseInt(yyMMdd.substring(2, 4));
            int day = Integer.parseInt(yyMMdd.substring(4, 6));

            int currentYY = Year.now().getValue() % 100;
            int century;
            if (isBirthDate) {
                century = (yy > currentYY) ? 1900 : 2000;
            } else {
                century = (yy < 50) ? 2000 : 1900;
            }

            return LocalDate.of(century + yy, month, day);
        } catch (Exception e) {
            return null;
        }
    }

    private static String titleCase(String value) {
        StringBuilder result = new StringBuilder();
        for (String word : value.split("\\s+")) {
            if (word.isEmpty()) continue;
            if (!result.isEmpty()) result.append(' ');
            result.append(Character.toUpperCase(word.charAt(0)))
                    .append(word.substring(1).toLowerCase());
        }
        return result.toString();
    }
}
