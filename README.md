# Secure KYC — Auth UI

Responsive login and registration screens for the KYC Verification System,
built with React 19 + Vite and React Router.

## What's here

- `/login` — email + password sign-in, "remember this device", forgot-password
  link, inline validation, loading and success states.
- `/register` — full name, work email, employee ID, password with a live
  strength meter, confirm-password check, policy acknowledgement checkbox.
- Shared split-screen `AuthLayout` with a brand panel (animated document-scan
  illustration) that collapses to a compact header on narrow viewports.
- `/verify` — the screen a reviewer lands on after logging in: upload the
  government ID and proof of address, watch OCR extraction run, review and
  correct the extracted fields (each flagged with a confidence level), then
  approve, reject, or request more information. Login redirects here
  automatically on success.
- `preview.html` — a dependency-free static copy of the same design (open it
  directly in a browser) if you just want to look at the UI without running
  the dev server.

## Stack

- React 19, React Router 7
- Vite 8
- Plain CSS with a small design-token system (`src/index.css`) — no UI
  framework, so it's easy to re-skin to match the rest of the KYC document
  set (navy `#1F2A36`, blue `#3B82C4`, green `#2E9E6B`, red `#D9534F`).

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
npm run lint        # oxlint
```

## Wiring up the backend

Both forms currently simulate the network call (see the TODO comments in
src/pages/LoginPage.jsx and src/pages/RegisterPage.jsx). Point them at
the Spring Boot / Spring Security JWT endpoints, e.g.:

```
POST /api/auth/login      { email, password }        -> { token }
POST /api/auth/register   { fullName, email, employeeId, password }
```

Store the returned JWT (e.g. in memory + an httpOnly refresh cookie, or
sessionStorage if that fits the existing architecture doc) and redirect to
the dashboard route on success.

## Folder structure

```
src/
  components/
    AuthLayout.jsx / .css   shared split-screen shell
    ScanIllustration.jsx    signature animated illustration
    FormField.jsx           labeled text input
    PasswordField.jsx       password input + show/hide + strength meter
    verification/
      CaseHeader.jsx        sticky top bar: case ref, customer, status pill
      Stepper.jsx           4-step progress indicator
      UploadDropzone.jsx    single drag-and-drop file slot
      UploadStep.jsx        ID + address upload cards
      ProcessingStep.jsx    OCR "in progress" state
      ReviewStep.jsx        document preview + editable extracted fields
      DecisionStep.jsx      approve / reject / request-info + notes
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    VerificationPage.jsx    orchestrates the /verify step flow
  styles/
    forms.css               shared field/button/alert styles (auth pages)
    verification.css        shared styles for the verification page
  utils/
    validators.js
```
