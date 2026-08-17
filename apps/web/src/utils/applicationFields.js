export const PERSONAL_FIELD_DEFS = [
  { key: "fullName", label: "Full name", section: "Personal information" },
  { key: "dateOfBirth", label: "Date of birth", type: "date", section: "Personal information" },
  { key: "gender", label: "Gender", section: "Personal information" },
  { key: "nationality", label: "Nationality", section: "Personal information" },
  { key: "contactNumber", label: "Contact number", section: "Personal information" },
  { key: "residentialAddress", label: "Residential address", section: "Personal information" },
  { key: "permanentAddress", label: "Permanent address", section: "Personal information" },
];

export const IDENTITY_FIELD_DEFS = [
  { key: "idType", label: "ID type", section: "Identity information" },
  { key: "idNumber", label: "ID number", section: "Identity information" },
  { key: "idExpiryDate", label: "ID expiry date", type: "date", section: "Identity information" },
];

export const ALL_FIELD_DEFS = [...PERSONAL_FIELD_DEFS, ...IDENTITY_FIELD_DEFS];

export function fieldsFromApplication(application) {
  return ALL_FIELD_DEFS.map((def) => ({ ...def, value: application?.[def.key] || "" }));
}

export function fieldsToRequestBody(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f.value]));
}
