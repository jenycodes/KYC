# Secure KYC — Auth UI

Login, registration, and role-based reviewer/customer dashboards for the KYC
Verification System, built with React 19 + Next.js (App Router).

## What's here

- `/login` — email + password sign-in, account-type selector, "remember this
  device", forgot-password link, inline validation, loading and success
  states.
- `/register` — full name, work email, employee/reviewer ID, password with a
  live strength meter, confirm-password check, policy acknowledgement
  checkbox.
- `/forgot-password`, `/reset-password` — password recovery flow.
- `/reviewer` — reviewer/admin workspace: case queue (pending/approved/
  rejected), document review, verification checklist, decisions, audit log
  and user management for admins.
- `/customer` — customer workspace: submit a new verification (upload →
  OCR-assisted field review → submit), track submission status, respond to
  correction requests.
- `/dashboard` and `/home` — redirect to the signed-in user's role-appropriate
  workspace.
- Shared split-screen `AuthLayout` with a brand panel (animated document-scan
  illustration) that collapses to a compact header on narrow viewports.

## Stack

- React 19, Next.js (App Router)
- Plain CSS with a small design-token system (`src/app/globals.css`) — no UI
  framework, so it's easy to re-skin to match the rest of the KYC document
  set (navy `#1F2A36`, blue `#3B82C4`, green `#2E9E6B`, red `#D9534F`).
- Auth is client-side: a JWT issued by the Spring Boot backend is kept in
  `localStorage` and attached as a `Bearer` header on every API call
  (`src/utils/authApi.js`, `src/utils/caseStore.js`).

## Getting started

```bash
npm install
npm run dev       # start the dev server on http://localhost:3000
npm run build     # production build -> .next/
npm run start     # run the production build
npm run lint      # oxlint
```

Copy `.env.local.example` (or see below) to `.env.local` and point it at the
backend:

```
NEXT_PUBLIC_API_BASE=http://localhost:8081/api/auth
```

## Wiring up the backend

Points at the Spring Boot / Spring Security JWT endpoints in `apps/backend`:

```
POST /api/auth/register        { fullName, email, password, confirmPassword, accountType, employeeId }
POST /api/auth/login           { email, password }
POST /api/auth/forgot-password { email }
POST /api/auth/reset-password  { token, email, password, confirmPassword }
GET  /api/auth/me
POST /api/auth/logout
```

## Folder structure

```
src/
  app/
    layout.jsx                root layout: metadata, fonts, globals.css, ErrorBoundary
    page.jsx                  "/" -> redirects to /login
    not-found.jsx             unmatched routes -> redirect to /login
    (auth)/
      login/page.jsx
      register/page.jsx
      forgot-password/page.jsx
      reset-password/page.jsx  (wrapped in Suspense — reads ?token=&email=)
    (protected)/
      reviewer/page.jsx        gated by RoleProtectedRoute (ADMIN, OFFICER)
      customer/page.jsx        gated by RoleProtectedRoute (CUSTOMER)
    dashboard/page.jsx, home/page.jsx   role-based redirect (DashboardRedirect)
  components/
    AuthLayout.jsx / .css      shared split-screen shell
    ErrorBoundary.jsx          top-level crash screen with a "reset session" action
    RoleProtectedRoute.jsx     client-side auth/role gate + redirect
    DashboardRedirect.jsx      redirects "/dashboard" and "/home" by role
    AlreadySignedIn.jsx        shown on /login and /register when already signed in
    ScanIllustration.jsx / StaticScanIllustration.jsx
    FormField.jsx, PasswordField.jsx
    dashboard/                 sidebar, case list, stats, admin/audit/compliance panels
    verification/              upload, OCR review, and decision step flow
  styles/
    forms.css, dashboard.css, verification.css
  utils/
    authApi.js                 fetch wrapper: login/register/session/401 handling
    applicationApi.js          KYC application/case CRUD + document upload
    applicationFields.js       OCR-extracted field defs/mapping
    caseStore.js                localStorage-backed session (user, token, role)
    session.js                  JWT decode/expiry helpers
    sessionNotice.js            one-shot "you were signed out" banner
    validators.js                client-side form validation rules
```

## Notes

- Auth state is entirely client-side (no cookies, no server session), so
  every route under `(auth)` and `(protected)` is a Client Component. Only
  `/` and the not-found page are Server Components.
- There's no Next.js middleware-based route protection — the backend issues
  no cookies (stateless JWT via `Authorization: Bearer`), so middleware would
  have nothing to read. Route gating happens client-side in
  `RoleProtectedRoute`, same as the previous React Router implementation.
