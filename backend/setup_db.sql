-- Eventora MySQL Database Initialization Script
-- Execute this script as MySQL root user or administrative user:
-- mysql -u root -p < setup_db.sql

CREATE DATABASE IF NOT EXISTS `eventora_db` 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Optional: Create dedicated application user if desired
-- CREATE USER IF NOT EXISTS 'eventora_user'@'localhost' IDENTIFIED BY 'EventoraSecure2026!';
-- GRANT ALL PRIVILEGES ON `eventora_db`.* TO 'eventora_user'@'localhost';
-- FLUSH PRIVILEGES;
