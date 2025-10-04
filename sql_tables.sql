-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: spadadtdbuser.mysql.db
-- Generation Time: Oct 04, 2025 at 09:34 AM
-- Server version: 8.4.6-6
-- PHP Version: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spadadtdbuser`
--

-- --------------------------------------------------------

--
-- Table structure for table `mom_challenges`
--

CREATE TABLE `mom_challenges` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `duration` varchar(100) DEFAULT NULL,
  `difficulty` enum('سهل','متوسط','صعب') DEFAULT 'متوسط',
  `participants` int DEFAULT '0',
  `reward` varchar(255) DEFAULT NULL,
  `status` enum('active','upcoming','completed') DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_challenge_requests`
--

CREATE TABLE `mom_challenge_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `challenge_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `admin_notes` text,
  `recu_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `admin_response_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_challenge_videos`
--

CREATE TABLE `mom_challenge_videos` (
  `id` int NOT NULL,
  `challenge_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_packs`
--

CREATE TABLE `mom_packs` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modules` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `students` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0+',
  `rating` decimal(2,1) NOT NULL DEFAULT '5.0',
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `intro_video_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_pack_sub_pack_links`
--

CREATE TABLE `mom_pack_sub_pack_links` (
  `id` int NOT NULL,
  `pack_id` int NOT NULL,
  `sub_pack_id` int NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_requests`
--

CREATE TABLE `mom_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `pack_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `admin_response_date` timestamp NULL DEFAULT NULL,
  `admin_notes` text,
  `recu_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_reservations`
--

CREATE TABLE `mom_reservations` (
  `id` int NOT NULL,
  `date` date NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_phone` varchar(20) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_reviews`
--

CREATE TABLE `mom_reviews` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `review_text` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `mom_sub_packs`
--

CREATE TABLE `mom_sub_packs` (
  `id` int NOT NULL,
  `pack_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `banner_image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `intro_video_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_sub_pack_requests`
--

CREATE TABLE `mom_sub_pack_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `sub_pack_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `admin_response_date` timestamp NULL DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `recu_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_sub_pack_videos`
--

CREATE TABLE `mom_sub_pack_videos` (
  `id` int NOT NULL,
  `sub_pack_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available_at` datetime DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_track_visitors`
--

CREATE TABLE `mom_track_visitors` (
  `id` int NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `page_visited` varchar(255) NOT NULL,
  `referrer` varchar(500) DEFAULT 'Direct',
  `user_agent` text,
  `city` varchar(100) DEFAULT 'Unknown',
  `country` varchar(100) DEFAULT 'Tunisia',
  `session_id` varchar(100) NOT NULL,
  `device_type` enum('desktop','mobile','tablet') DEFAULT 'desktop',
  `browser` varchar(50) DEFAULT 'Unknown',
  `operating_system` varchar(50) DEFAULT 'Unknown',
  `screen_resolution` varchar(20) DEFAULT NULL,
  `language` varchar(5) DEFAULT NULL,
  `time_on_page` int DEFAULT NULL,
  `is_mobile` tinyint(1) DEFAULT '0',
  `is_bot` tinyint(1) DEFAULT '0',
  `visit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_users`
--

CREATE TABLE `mom_users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_workshops`
--

CREATE TABLE `mom_workshops` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `duration` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL DEFAULT 'ورشة تدريبية',
  `next_date` date NOT NULL,
  `enrolled_count` int DEFAULT '0',
  `max_participants` int DEFAULT '50',
  `location` varchar(255) NOT NULL,
  `highlights` json DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_workshop_requests`
--

CREATE TABLE `mom_workshop_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `workshop_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `admin_notes` text,
  `recu_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `admin_response_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mom_workshop_videos`
--

CREATE TABLE `mom_workshop_videos` (
  `id` int NOT NULL,
  `workshop_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `mom_challenges`
--
ALTER TABLE `mom_challenges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mom_challenge_requests`
--
ALTER TABLE `mom_challenge_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_challenge` (`user_id`,`challenge_id`),
  ADD KEY `challenge_id` (`challenge_id`);

--
-- Indexes for table `mom_challenge_videos`
--
ALTER TABLE `mom_challenge_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `challenge_id` (`challenge_id`);

--
-- Indexes for table `mom_packs`
--
ALTER TABLE `mom_packs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mom_pack_sub_pack_links`
--
ALTER TABLE `mom_pack_sub_pack_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pack_sub_pack` (`pack_id`,`sub_pack_id`),
  ADD KEY `pack_id` (`pack_id`),
  ADD KEY `sub_pack_id` (`sub_pack_id`);

--
-- Indexes for table `mom_requests`
--
ALTER TABLE `mom_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_pack` (`user_id`,`pack_id`),
  ADD KEY `idx_requests_user_id` (`user_id`),
  ADD KEY `idx_requests_pack_id` (`pack_id`),
  ADD KEY `idx_requests_status` (`status`),
  ADD KEY `idx_requests_recu_link` (`recu_link`);

--
-- Indexes for table `mom_reservations`
--
ALTER TABLE `mom_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `mom_reviews`
--
ALTER TABLE `mom_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_user_id` (`user_id`),
  ADD KEY `idx_reviews_rating` (`rating`),
  ADD KEY `idx_reviews_status` (`status`),
  ADD KEY `idx_reviews_created_at` (`created_at`);

--
-- Indexes for table `mom_sub_packs`
--
ALTER TABLE `mom_sub_packs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pack_id` (`pack_id`);

--
-- Indexes for table `mom_sub_pack_requests`
--
ALTER TABLE `mom_sub_pack_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_sub_pack_id` (`sub_pack_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `mom_sub_pack_videos`
--
ALTER TABLE `mom_sub_pack_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_pack_id` (`sub_pack_id`),
  ADD KEY `idx_available_at` (`available_at`);

--
-- Indexes for table `mom_track_visitors`
--
ALTER TABLE `mom_track_visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_date` (`ip_address`,`visit_date`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_page` (`page_visited`),
  ADD KEY `idx_country` (`country`),
  ADD KEY `idx_device` (`device_type`),
  ADD KEY `idx_referrer` (`referrer`(255));

--
-- Indexes for table `mom_users`
--
ALTER TABLE `mom_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `mom_workshops`
--
ALTER TABLE `mom_workshops`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mom_workshop_requests`
--
ALTER TABLE `mom_workshop_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_workshop` (`user_id`,`workshop_id`),
  ADD KEY `workshop_id` (`workshop_id`),
  ADD KEY `idx_workshop_request_status` (`status`),
  ADD KEY `idx_workshop_request_user` (`user_id`);

--
-- Indexes for table `mom_workshop_videos`
--
ALTER TABLE `mom_workshop_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workshop_id` (`workshop_id`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `mom_challenges`
--
ALTER TABLE `mom_challenges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_challenge_requests`
--
ALTER TABLE `mom_challenge_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_challenge_videos`
--
ALTER TABLE `mom_challenge_videos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_packs`
--
ALTER TABLE `mom_packs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_pack_sub_pack_links`
--
ALTER TABLE `mom_pack_sub_pack_links`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_requests`
--
ALTER TABLE `mom_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_reservations`
--
ALTER TABLE `mom_reservations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_reviews`
--
ALTER TABLE `mom_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_sub_packs`
--
ALTER TABLE `mom_sub_packs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_sub_pack_requests`
--
ALTER TABLE `mom_sub_pack_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_sub_pack_videos`
--
ALTER TABLE `mom_sub_pack_videos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_track_visitors`
--
ALTER TABLE `mom_track_visitors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_users`
--
ALTER TABLE `mom_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_workshops`
--
ALTER TABLE `mom_workshops`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_workshop_requests`
--
ALTER TABLE `mom_workshop_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_workshop_videos`
--
ALTER TABLE `mom_workshop_videos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `mom_challenge_requests`
--
ALTER TABLE `mom_challenge_requests`
  ADD CONSTRAINT `mom_challenge_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `mom_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mom_challenge_requests_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `mom_challenges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_challenge_videos`
--
ALTER TABLE `mom_challenge_videos`
  ADD CONSTRAINT `mom_challenge_videos_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `mom_challenges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_pack_sub_pack_links`
--
ALTER TABLE `mom_pack_sub_pack_links`
  ADD CONSTRAINT `mom_pack_sub_pack_links_ibfk_1` FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mom_pack_sub_pack_links_ibfk_2` FOREIGN KEY (`sub_pack_id`) REFERENCES `mom_sub_packs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_requests`
--
ALTER TABLE `mom_requests`
  ADD CONSTRAINT `mom_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `mom_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mom_requests_ibfk_2` FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_reviews`
--
ALTER TABLE `mom_reviews`
  ADD CONSTRAINT `mom_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `mom_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_sub_packs`
--
ALTER TABLE `mom_sub_packs`
  ADD CONSTRAINT `mom_sub_packs_ibfk_1` FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_sub_pack_videos`
--
ALTER TABLE `mom_sub_pack_videos`
  ADD CONSTRAINT `mom_sub_pack_videos_ibfk_1` FOREIGN KEY (`sub_pack_id`) REFERENCES `mom_sub_packs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_workshop_requests`
--
ALTER TABLE `mom_workshop_requests`
  ADD CONSTRAINT `mom_workshop_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `mom_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mom_workshop_requests_ibfk_2` FOREIGN KEY (`workshop_id`) REFERENCES `mom_workshops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mom_workshop_videos`
--
ALTER TABLE `mom_workshop_videos`
  ADD CONSTRAINT `mom_workshop_videos_ibfk_1` FOREIGN KEY (`workshop_id`) REFERENCES `mom_workshops` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
