-- =============================================================================
-- FACIAL RECOGNITION ATTENDANCE SYSTEM - MYSQL DATABASE INITIALIZATION SCRIPT
-- Database: facial_recognition_database
-- Password: 
-- Total Tables: 44 Tables across 18 Functional Modules
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `facial_recognition_database` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `facial_recognition_database`;

-- -----------------------------------------------------------------------------
-- 1. AUTHENTICATION & AUTHORIZATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `permissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `permission_name` VARCHAR(100) NOT NULL UNIQUE,
    `module` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `role_permissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `role_id` VARCHAR(36) NOT NULL,
    `permission_id` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `organizations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `departments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `organization_id` VARCHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `employee_number_student_number` VARCHAR(100) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(50) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(20) NULL,
    `date_of_birth` DATE NULL,
    `profile_photo` LONGTEXT NULL,
    `status` VARCHAR(50) DEFAULT 'active',
    `organization_id` VARCHAR(36) NULL,
    `department_id` VARCHAR(36) NULL,
    `role_id` VARCHAR(36) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `token` TEXT NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `revoked` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `login_history` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `browser` VARCHAR(100) NULL,
    `operating_system` VARCHAR(100) NULL,
    `login_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `logout_time` DATETIME NULL,
    `status` VARCHAR(50) DEFAULT 'success',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 2. ORGANIZATION STRUCTURE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `branches` (
    `id` VARCHAR(36) PRIMARY KEY,
    `organization_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `buildings` (
    `id` VARCHAR(36) PRIMARY KEY,
    `branch_id` VARCHAR(36) NULL,
    `building_name` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rooms` (
    `id` VARCHAR(36) PRIMARY KEY,
    `building_id` VARCHAR(36) NOT NULL,
    `room_number` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 3. USER DETAILS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_profiles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL UNIQUE,
    `national_id` VARCHAR(100) NULL,
    `emergency_contact` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `blood_group` VARCHAR(10) NULL,
    `profile_completion` FLOAT DEFAULT 100.0,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `designations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_designations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `designation_id` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`designation_id`) REFERENCES `designations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 4. FACIAL RECOGNITION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `face_profiles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL UNIQUE,
    `embedding_version` VARCHAR(50) DEFAULT 'v1-ArcFace-512d',
    `total_embeddings` INT DEFAULT 0,
    `enrollment_status` VARCHAR(50) DEFAULT 'completed',
    `average_confidence` FLOAT DEFAULT 98.5,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `face_embeddings` (
    `id` VARCHAR(36) PRIMARY KEY,
    `face_profile_id` VARCHAR(36) NOT NULL,
    `embedding_data` LONGTEXT NOT NULL, -- JSON 512 float array
    `quality_score` FLOAT DEFAULT 95.0,
    `pose_score` FLOAT DEFAULT 98.0,
    `lighting_score` FLOAT DEFAULT 96.0,
    `blur_score` FLOAT DEFAULT 97.0,
    `image_path` LONGTEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`face_profile_id`) REFERENCES `face_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `enrollment_sessions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `captured_images` INT DEFAULT 0,
    `successful_images` INT DEFAULT 0,
    `enrollment_status` VARCHAR(50) DEFAULT 'in_progress',
    `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `completed_at` DATETIME NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cameras` (
    `id` VARCHAR(36) PRIMARY KEY,
    `camera_name` VARCHAR(255) NOT NULL,
    `camera_type` VARCHAR(50) DEFAULT 'RTSP',
    `rtsp_url` LONGTEXT NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'online'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `recognition_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NULL,
    `camera_id` VARCHAR(36) NULL,
    `confidence_score` FLOAT NOT NULL,
    `recognition_result` VARCHAR(50) DEFAULT 'verified',
    `recognition_image` LONGTEXT NULL,
    `processing_time` FLOAT DEFAULT 0.045,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `unknown_faces` (
    `id` VARCHAR(36) PRIMARY KEY,
    `camera_id` VARCHAR(36) NULL,
    `snapshot` LONGTEXT NOT NULL,
    `confidence` FLOAT DEFAULT 45.0,
    `reviewed` BOOLEAN DEFAULT FALSE,
    `assigned_user_id` VARCHAR(36) NULL,
    `detected_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `watchlist` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `reason` TEXT NULL,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 5. LIVENESS DETECTION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `liveness_checks` (
    `id` VARCHAR(36) PRIMARY KEY,
    `recognition_log_id` VARCHAR(36) NOT NULL,
    `blink_detected` BOOLEAN DEFAULT TRUE,
    `head_rotation` BOOLEAN DEFAULT TRUE,
    `spoof_detected` BOOLEAN DEFAULT FALSE,
    `liveness_score` FLOAT DEFAULT 99.0,
    `status` VARCHAR(50) DEFAULT 'passed',
    FOREIGN KEY (`recognition_log_id`) REFERENCES `recognition_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 6. ATTENDANCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `attendance_date` DATE NOT NULL,
    `clock_in` TIME NOT NULL,
    `clock_out` TIME NULL,
    `total_hours` FLOAT DEFAULT 0.0,
    `attendance_status` VARCHAR(50) DEFAULT 'present',
    `recognition_log_id` VARCHAR(36) NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recognition_log_id`) REFERENCES `recognition_logs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance_breaks` (
    `id` VARCHAR(36) PRIMARY KEY,
    `attendance_id` VARCHAR(36) NOT NULL,
    `break_start` TIME NOT NULL,
    `break_end` TIME NULL,
    `duration` FLOAT DEFAULT 0.0,
    FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance_corrections` (
    `id` VARCHAR(36) PRIMARY KEY,
    `attendance_id` VARCHAR(36) NOT NULL,
    `requested_by` VARCHAR(36) NOT NULL,
    `approved_by` VARCHAR(36) NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance_rules` (
    `id` VARCHAR(36) PRIMARY KEY,
    `grace_period` INT DEFAULT 15,
    `late_after` TIME DEFAULT '09:15:00',
    `minimum_hours` FLOAT DEFAULT 8.0,
    `overtime_after` TIME DEFAULT '17:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance_events` (
    `id` VARCHAR(36) PRIMARY KEY,
    `attendance_id` VARCHAR(36) NOT NULL,
    `event` VARCHAR(100) NOT NULL,
    `event_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `camera_id` VARCHAR(36) NULL,
    FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 7. LEAVE MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `leave_types` (
    `id` VARCHAR(36) PRIMARY KEY,
    `leave_name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `leave_requests` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `leave_type_id` VARCHAR(36) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 8. SCHEDULING
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `shifts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `shift_name` VARCHAR(100) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_shifts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `shift_id` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `holidays` (
    `id` VARCHAR(36) PRIMARY KEY,
    `holiday_name` VARCHAR(255) NOT NULL,
    `holiday_date` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 9. CAMERA MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `camera_groups` (
    `id` VARCHAR(36) PRIMARY KEY,
    `group_name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `camera_group_members` (
    `id` VARCHAR(36) PRIMARY KEY,
    `group_id` VARCHAR(36) NOT NULL,
    `camera_id` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`group_id`) REFERENCES `camera_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `camera_health` (
    `id` VARCHAR(36) PRIMARY KEY,
    `camera_id` VARCHAR(36) NOT NULL,
    `cpu_usage` FLOAT DEFAULT 15.4,
    `storage_usage` FLOAT DEFAULT 45.0,
    `online_status` BOOLEAN DEFAULT TRUE,
    `checked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 10. VISITORS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `visitors` (
    `id` VARCHAR(36) PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `organization` VARCHAR(255) NULL,
    `photo` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `visitor_visits` (
    `id` VARCHAR(36) PRIMARY KEY,
    `visitor_id` VARCHAR(36) NOT NULL,
    `host_id` VARCHAR(36) NOT NULL,
    `check_in` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `check_out` DATETIME NULL,
    `purpose` TEXT NOT NULL,
    FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 11. REPORTS & NOTIFICATIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `generated_reports` (
    `id` VARCHAR(36) PRIMARY KEY,
    `report_name` VARCHAR(255) NOT NULL,
    `report_type` VARCHAR(100) NOT NULL,
    `generated_by` VARCHAR(36) NULL,
    `file_path` LONGTEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notification_templates` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `notification_type` VARCHAR(50) DEFAULT 'system',
    `read_status` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 12. AUDIT & LOGGING
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `level` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 13. SETTINGS, ANALYTICS, FILES & API MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` VARCHAR(36) PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `organization_settings` (
    `id` VARCHAR(36) PRIMARY KEY,
    `organization_id` VARCHAR(36) NOT NULL,
    `timezone` VARCHAR(50) DEFAULT 'UTC+03:00',
    `attendance_policy` TEXT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `dashboard_statistics` (
    `id` VARCHAR(36) PRIMARY KEY,
    `attendance_today` INT DEFAULT 0,
    `recognition_accuracy` FLOAT DEFAULT 99.4,
    `unknown_faces` INT DEFAULT 0,
    `late_arrivals` INT DEFAULT 0,
    `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `files` (
    `id` VARCHAR(36) PRIMARY KEY,
    `uploaded_by` VARCHAR(36) NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` LONGTEXT NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `size` BIGINT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `scheduled_jobs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `job_name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'idle',
    `started_at` DATETIME NULL,
    `finished_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `api_keys` (
    `id` VARCHAR(36) PRIMARY KEY,
    `key_name` VARCHAR(100) NOT NULL,
    `api_key` VARCHAR(255) NOT NULL UNIQUE,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `endpoint` VARCHAR(255) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `response_code` INT NOT NULL,
    `response_time` FLOAT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
