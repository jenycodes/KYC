# SecureKYC database schema

The backend uses MySQL 8+ and the `securekyc` database. The canonical initial schema is [database-schema-mysql.sql](database-schema-mysql.sql). In local development, Hibernate also has `ddl-auto=update` enabled so existing developer databases can be upgraded.

## Tables

| Table | Purpose | Main relationships |
| --- | --- | --- |
| `users` | Customer, officer, and administrator accounts; BCrypt password hashes; active session ID | Referenced by all user-owned records |
| `password_reset_tokens` | One active, expiring password-reset token per user | `user_id -> users.id` |
| `kyc_applications` | KYC form data, lifecycle status, ownership and assignment | Customer and optional assigned officer |
| `kyc_documents` | Versioned document metadata; file bytes remain in configured upload storage | Application and uploading user |
| `verification_checks` | Officer validation results for each application check type | Application and optional checking officer |
| `notifications` | In-app workflow notifications | Recipient and optional application |
| `audit_log_entries` | Append-only record of submissions, decisions, and reassignments | Optional actor and application |

## Application lifecycle

```text
DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED | REJECTED | ESCALATED
                                  -> ADDITIONAL_INFO_REQUIRED -> UNDER_REVIEW
```

When an active officer is available, submission goes directly to `UNDER_REVIEW` and is assigned to the officer with the lowest open workload. Otherwise it remains `SUBMITTED` until an administrator reassigns it.

## Local setup

1. Set `DB_USERNAME` and `DB_PASSWORD` in your terminal or IDE.
2. Run `setup-database.bat` to create a fresh schema, or let Hibernate update an existing development schema.
3. Set `JWT_SECRET` to a random value of at least 32 characters before starting the backend.
4. Configure `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM` only when email delivery is required.

Never commit database, SMTP, admin-seed, or JWT values. Use `securekyc-backend/.env.example` as the configuration reference.

## Production note

Use a versioned migration tool such as Flyway before production. `ddl-auto=update` is deliberately retained for local development compatibility but is not a production deployment strategy.
