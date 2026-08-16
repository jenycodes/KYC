-- SecureKYC schema for MySQL 8.0+.
-- This reflects the JPA entities used by the application as of August 2026.

CREATE DATABASE IF NOT EXISTS securekyc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE securekyc;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'OFFICER', 'ADMIN') NOT NULL,
  session_id VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX idx_users_role_active (role, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(100) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL UNIQUE,
  expiry_date DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_token_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kyc_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  assigned_officer_id BIGINT,
  status ENUM('DRAFT','SUBMITTED','UNDER_REVIEW','ADDITIONAL_INFO_REQUIRED','APPROVED','REJECTED','ESCALATED') NOT NULL,
  full_name VARCHAR(255), date_of_birth DATE, gender VARCHAR(255), nationality VARCHAR(255),
  contact_number VARCHAR(255), residential_address VARCHAR(1000), permanent_address VARCHAR(1000),
  id_type VARCHAR(255), id_number VARCHAR(255), id_expiry_date DATE, correction_reason VARCHAR(2000),
  created_at DATETIME NOT NULL, submitted_at DATETIME, decided_at DATETIME, updated_at DATETIME NOT NULL,
  CONSTRAINT fk_application_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_application_officer FOREIGN KEY (assigned_officer_id) REFERENCES users(id),
  INDEX idx_application_customer (customer_id),
  INDEX idx_application_officer_status (assigned_officer_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kyc_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_id BIGINT NOT NULL,
  document_type ENUM('GOVERNMENT_ID','ADDRESS_PROOF','PASSPORT','PHOTOGRAPH','SIGNATURE','SUPPORTING') NOT NULL,
  file_name VARCHAR(255) NOT NULL, stored_path VARCHAR(255) NOT NULL, file_size BIGINT NOT NULL,
  content_type VARCHAR(255) NOT NULL, uploaded_by BIGINT NOT NULL, version INT NOT NULL DEFAULT 1,
  verification_status ENUM('PENDING','VERIFIED','FAILED','REQUIRES_CLARIFICATION') NOT NULL DEFAULT 'PENDING',
  remarks VARCHAR(1000), uploaded_at DATETIME NOT NULL,
  CONSTRAINT fk_document_application FOREIGN KEY (application_id) REFERENCES kyc_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_document_application_type (application_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verification_checks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_id BIGINT NOT NULL,
  check_type ENUM('NAME','DATE_OF_BIRTH','ID_NUMBER','PHOTOGRAPH','DOCUMENT_VALIDITY','ADDRESS','DOCUMENT_TYPE','DOCUMENT_COMPLETENESS') NOT NULL,
  status ENUM('PENDING','VERIFIED','FAILED','REQUIRES_CLARIFICATION') NOT NULL DEFAULT 'PENDING',
  remarks VARCHAR(1000), checked_by BIGINT, checked_at DATETIME NOT NULL,
  CONSTRAINT fk_check_application FOREIGN KEY (application_id) REFERENCES kyc_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_check_officer FOREIGN KEY (checked_by) REFERENCES users(id),
  UNIQUE KEY uq_check_application_type (application_id, check_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recipient_id BIGINT NOT NULL,
  type ENUM('APPLICATION_SUBMITTED','MOVED_TO_REVIEW','ADDITIONAL_INFO_REQUIRED','APPROVED','REJECTED','ASSIGNED','REASSIGNED','RESUBMITTED','ESCALATED','WORKLOAD_THRESHOLD') NOT NULL,
  message VARCHAR(500) NOT NULL, application_id BIGINT, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME NOT NULL,
  CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_application FOREIGN KEY (application_id) REFERENCES kyc_applications(id) ON DELETE SET NULL,
  INDEX idx_notification_recipient_read (recipient_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_id BIGINT, actor_role VARCHAR(255) NOT NULL, action VARCHAR(255) NOT NULL, application_id BIGINT,
  previous_status VARCHAR(255), new_status VARCHAR(255), detail VARCHAR(1000), created_at DATETIME NOT NULL,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_application FOREIGN KEY (application_id) REFERENCES kyc_applications(id) ON DELETE SET NULL,
  INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
