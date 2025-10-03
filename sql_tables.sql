-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: spadadtdbuser.mysql.db
-- Generation Time: Oct 03, 2025 at 09:56 AM
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

--
-- Dumping data for table `mom_challenges`
--

INSERT INTO `mom_challenges` (`id`, `title`, `description`, `duration`, `difficulty`, `participants`, `reward`, `status`, `start_date`, `end_date`, `price`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'تحدي الأم الواعية - 30 يوم', 'تحدي شامل لتطوير مهارات الأمومة الواعية خلال 30 يوماً من خلال أنشطة يومية وتمارين عملية', '30 يوم', 'متوسط', 156, 'شهادة إنجاز + استشارة مجانية', 'active', '2024-01-01', '2024-01-31', 199.00, NULL, '2025-10-03 07:44:05', '2025-10-03 07:44:05'),
(2, 'تحدي إدارة الوقت للأمهات', 'تعلمي كيفية تنظيم وقتك بفعالية بين المسؤوليات المختلفة من خلال تقنيات عملية مجربة', '14 يوم', 'سهل', 89, 'دليل تنظيم الوقت الشخصي', 'upcoming', '2024-02-01', '2024-02-14', 149.00, NULL, '2025-10-03 07:44:05', '2025-10-03 07:44:05'),
(3, 'تحدي الذكاء العاطفي', 'رحلة تطوير الذكاء العاطفي لفهم وإدارة المشاعر بطريقة صحية للأم والطفل', '21 يوم', 'صعب', 67, 'برنامج متقدم في الذكاء العاطفي', 'active', '2024-01-15', '2024-02-05', 249.00, NULL, '2025-10-03 07:44:05', '2025-10-03 07:44:05');

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

--
-- Dumping data for table `mom_challenge_requests`
--

INSERT INTO `mom_challenge_requests` (`id`, `user_id`, `challenge_id`, `status`, `admin_notes`, `recu_link`, `created_at`, `admin_response_date`) VALUES
(1, 23, 1, 'pending', NULL, NULL, '2025-10-03 07:45:47', NULL),
(2, 23, 3, 'pending', NULL, NULL, '2025-10-03 07:46:14', NULL);

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
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mom_packs`
--

INSERT INTO `mom_packs` (`id`, `title`, `modules`, `price`, `duration`, `students`, `rating`, `image_url`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'الدراسي 1', 'دورة الدراسة,دورة الثقة بالنفس,دورة التربية النفسية', '299 TND', '4 أسابيع', '150+', 4.9, 'https://i.ibb.co/1VNXrkN/White-And-Navy-Modern-Business-Proposal-Cover-Page-1.png', 'باك دراسي شامل لتطوير المهارات الأساسية والثقة بالنفس', 'active', '2025-09-27 17:05:48', '2025-09-27 17:11:29'),
(2, 'الدراسي 2', 'دورة الثقة بالنفس,دورة الدراسة,دورة السيطرة على الغضب', '349 TND', '5 أسابيع', '120+', 4.8, 'https://i.ibb.co/1VNXrkN/White-And-Navy-Modern-Business-Proposal-Cover-Page-1.png', 'باك متقدم لبناء الثقة والمهارات الدراسية مع إدارة الغضب', 'active', '2025-09-27 17:05:48', '2025-09-27 17:11:33'),
(3, 'الدراسي 3', 'دورة السيطرة على الغضب,دورة الدراسة,دورة تحدي الحياة', '399 TND', '6 أسابيع', '95+', 4.9, 'https://i.ibb.co/1VNXrkN/White-And-Navy-Modern-Business-Proposal-Cover-Page-1.png', 'باك شامل للتطوير الشخصي والدراسي مع تحديات الحياة', 'active', '2025-09-27 17:05:48', '2025-09-27 17:11:36'),
(4, 'المراهقة', 'السيطرة على الغضب,دورة المراهقة,تحدي الحياة', '449 TND', '6 أسابيع', '85+', 4.7, 'https://i.ibb.co/s9ZQpWhr/White-And-Navy-Modern-Business-Proposal-Cover-Page-2.png', 'باك مخصص لفترة المراهقة وتحدياتها مع إدارة الغضب', 'active', '2025-09-27 17:05:48', '2025-09-27 17:14:15'),
(5, 'الأم الجديدة', 'السيطرة على الغضب,سنة أولى أمومة,تحدي الحياة', '479 TND', '7 أسابيع', '140+', 4.8, 'https://i.ibb.co/s9ZQpWhr/White-And-Navy-Modern-Business-Proposal-Cover-Page-2.png', 'باك مخصص للأمهات الجدد لإدارة التحديات والغضب', 'active', '2025-09-27 17:05:48', '2025-09-27 17:14:18'),
(6, 'الذكاء العاطفي', 'السيطرة على الغضب,الذكاء العاطفي,تحدي الحياة', '599 TND', '8 أسابيع', '75+', 4.9, 'https://i.ibb.co/s9ZQpWhr/White-And-Navy-Modern-Business-Proposal-Cover-Page-2.png', 'باك شامل لتطوير الذكاء العاطفي وإدارة المشاعر', 'active', '2025-09-27 17:05:48', '2025-09-27 17:14:23'),
(7, 'الثقة', 'دورة الثقة بالنفس,دورة تحدي الحياة,دورة السيطرة على الغضب', '379 TND', '5 أسابيع', '160+', 4.8, 'https://i.ibb.co/QvV62d01/White-And-Navy-Modern-Business-Proposal-Cover-Page-3.png', 'باك مخصص لبناء الثقة بالنفس ومواجهة تحديات الحياة', 'active', '2025-09-27 17:05:48', '2025-09-27 17:15:53'),
(8, 'الذهني', 'دورة تحدي الحياة,دورة السيطرة على الغضب,دورة الطفل العنيد', '529 TND', '7 أسابيع', '110+', 4.7, 'https://i.ibb.co/QvV62d01/White-And-Navy-Modern-Business-Proposal-Cover-Page-3.png', 'باك للتطوير الذهني وإدارة سلوك الأطفال الصعب', 'active', '2025-09-27 17:05:48', '2025-09-27 17:15:51');

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

--
-- Dumping data for table `mom_requests`
--

INSERT INTO `mom_requests` (`id`, `user_id`, `pack_id`, `status`, `request_date`, `admin_response_date`, `admin_notes`, `recu_link`, `created_at`, `updated_at`) VALUES
(4, 1, 1, 'pending', '2025-09-27 18:05:15', NULL, NULL, NULL, '2025-09-27 18:05:15', '2025-09-27 18:05:15'),
(5, 1, 2, 'accepted', '2025-09-27 18:05:18', '2025-09-27 19:27:13', '', NULL, '2025-09-27 18:05:18', '2025-09-27 19:27:13'),
(6, 13, 1, 'accepted', '2025-09-28 07:22:26', '2025-09-28 07:23:48', '', NULL, '2025-09-28 07:22:26', '2025-09-28 07:23:48'),
(7, 13, 2, 'accepted', '2025-09-28 08:02:12', '2025-09-28 08:03:18', '', NULL, '2025-09-28 08:02:12', '2025-09-28 08:03:18'),
(8, 14, 2, 'accepted', '2025-09-28 08:22:22', '2025-09-28 08:22:38', '', NULL, '2025-09-28 08:22:22', '2025-09-28 08:22:38'),
(9, 17, 1, 'accepted', '2025-09-28 13:08:34', '2025-09-28 13:09:33', '', NULL, '2025-09-28 13:08:34', '2025-09-28 13:09:33'),
(10, 17, 2, 'accepted', '2025-09-28 13:34:38', '2025-09-28 13:34:46', '', NULL, '2025-09-28 13:34:38', '2025-09-28 13:34:46'),
(11, 16, 1, 'pending', '2025-09-29 07:28:25', NULL, NULL, NULL, '2025-09-29 07:28:25', '2025-09-29 07:28:25'),
(12, 16, 2, 'pending', '2025-09-29 07:53:11', NULL, NULL, NULL, '2025-09-29 07:53:11', '2025-09-29 07:53:11'),
(13, 16, 3, 'pending', '2025-09-29 08:03:00', NULL, '', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759133200_7934.png', '2025-09-29 08:03:00', '2025-09-29 08:06:40'),
(14, 16, 8, 'pending', '2025-09-29 08:05:41', NULL, NULL, NULL, '2025-09-29 08:05:41', '2025-09-29 08:05:41'),
(15, 16, 7, 'pending', '2025-09-29 08:06:04', NULL, NULL, NULL, '2025-09-29 08:06:04', '2025-09-29 08:06:04'),
(16, 16, 6, 'pending', '2025-09-29 08:06:08', NULL, NULL, NULL, '2025-09-29 08:06:08', '2025-09-29 08:06:08'),
(17, 16, 4, 'pending', '2025-09-29 08:31:16', NULL, NULL, NULL, '2025-09-29 08:31:16', '2025-09-29 08:31:16'),
(18, 19, 1, 'pending', '2025-09-29 08:35:51', NULL, NULL, NULL, '2025-09-29 08:35:51', '2025-09-29 08:35:51'),
(19, 19, 2, 'pending', '2025-09-29 08:38:02', NULL, NULL, NULL, '2025-09-29 08:38:02', '2025-09-29 08:38:02'),
(20, 20, 1, 'pending', '2025-09-29 08:46:03', NULL, NULL, NULL, '2025-09-29 08:46:03', '2025-09-29 08:46:03'),
(21, 19, 4, 'accepted', '2025-09-29 09:10:23', '2025-09-29 09:23:04', '', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759137039_7193.png', '2025-09-29 09:10:23', '2025-09-29 09:23:04');

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

--
-- Dumping data for table `mom_reviews`
--

INSERT INTO `mom_reviews` (`id`, `user_id`, `user_name`, `user_email`, `rating`, `review_text`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Admin', 'admin@spadadibattaglia.com', 5, 'خدمة ممتازة جداً، ساعدتني كثيراً في تطوير شخصيتي وثقتي بنفسي. أنصح الجميع بالتجربة', 'pending', '2025-09-27 19:13:34', '2025-09-27 19:38:29'),
(2, 1, 'سارة أحمد', 'sara@example.com', 5, 'الدورات مفيدة جداً وطريقة التعليم رائعة. تعلمت الكثير من المهارات المهمة', 'rejected', '2025-09-27 19:13:34', '2025-09-27 19:39:13'),
(3, 1, 'فاطمة محمد', 'fatima@example.com', 4, 'تجربة جيدة جداً، المحتوى قيم والمدربة متمكنة. أتطلع للمزيد من الدورات', 'approved', '2025-09-27 19:13:34', '2025-09-27 19:13:34'),
(4, 1, 'نور الهدى', 'nour@example.com', 5, 'ساعدني البرنامج كثيراً في التعامل مع التحديات اليومية. شكراً لكم', 'approved', '2025-09-27 19:13:34', '2025-09-27 19:13:34'),
(5, 1, 'ليلى حسن', 'layla@example.com', 4, 'دورات مفيدة ومحتوى غني. التطبيق العملي للمفاهيم كان الأهم', 'approved', '2025-09-27 19:13:34', '2025-09-27 19:13:34');

-- --------------------------------------------------------

--
-- Table structure for table `mom_sub_packs`
--

CREATE TABLE `mom_sub_packs` (
  `id` int NOT NULL,
  `pack_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mom_sub_packs`
--

INSERT INTO `mom_sub_packs` (`id`, `pack_id`, `title`, `description`, `order_index`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'دورة الدراسة', 'تطوير مهارات الدراسة الفعالة والتركيز', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(2, 1, 'دورة الثقة بالنفس', 'بناء الثقة بالنفس والتغلب على القلق', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(3, 1, 'دورة التربية النفسية', 'فهم النفسية وتطوير الصحة النفسية', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(4, 2, 'دورة الثقة بالنفس', 'تعزيز الثقة بالنفس والقدرة على اتخاذ القرارات', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(5, 2, 'دورة الدراسة', 'تقنيات دراسية متقدمة وإدارة الوقت', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(6, 2, 'دورة السيطرة على الغضب', 'تعلم إدارة الغضب والانفعالات بطريقة صحية', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(7, 3, 'دورة السيطرة على الغضب', 'إتقان فنون التحكم في الغضب والهدوء', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(8, 3, 'دورة الدراسة', 'استراتيجيات دراسية للنجاح الأكاديمي', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(9, 3, 'دورة تحدي الحياة', 'مواجهة تحديات الحياة بثقة وإصرار', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(10, 4, 'السيطرة على الغضب', 'إدارة الغضب في فترة المراهقة الحساسة', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(11, 4, 'دورة المراهقة', 'فهم تحديات المراهقة والتعامل معها', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(12, 4, 'تحدي الحياة', 'بناء شخصية قوية لمواجهة الحياة', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(13, 5, 'السيطرة على الغضب', 'إدارة التوتر والغضب كأم جديدة', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(14, 5, 'سنة أولى أمومة', 'دليل شامل للعام الأول من الأمومة', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(15, 5, 'تحدي الحياة', 'التوازن بين الأمومة والحياة الشخصية', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(16, 6, 'السيطرة على الغضب', 'التحكم في الانفعالات عبر الذكاء العاطفي', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(17, 6, 'الذكاء العاطفي', 'تطوير المهارات العاطفية والاجتماعية', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(18, 6, 'تحدي الحياة', 'استخدام الذكاء العاطفي في مواجهة التحديات', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(19, 7, 'دورة الثقة بالنفس', 'بناء الثقة الراسخة بالذات والقدرات', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(20, 7, 'دورة تحدي الحياة', 'الثقة في مواجهة صعوبات الحياة', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(21, 7, 'دورة السيطرة على الغضب', 'الثقة في إدارة المشاعر السلبية', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(22, 8, 'دورة تحدي الحياة', 'التطور الذهني لمواجهة التحديات', 1, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(23, 8, 'دورة السيطرة على الغضب', 'القوة الذهنية للتحكم في الانفعالات', 2, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(24, 8, 'دورة الطفل العنيد', 'استراتيجيات ذهنية للتعامل مع الطفل العنيد', 3, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48');

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

--
-- Dumping data for table `mom_sub_pack_requests`
--

INSERT INTO `mom_sub_pack_requests` (`id`, `user_id`, `sub_pack_id`, `status`, `request_date`, `admin_response_date`, `admin_notes`, `recu_link`, `created_at`, `updated_at`) VALUES
(1, 19, 1, 'accepted', '2025-09-29 21:18:57', '2025-09-29 21:31:28', '', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759181214_3941.png', '2025-09-29 21:18:57', '2025-09-29 21:31:28');

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

--
-- Dumping data for table `mom_sub_pack_videos`
--

INSERT INTO `mom_sub_pack_videos` (`id`, `sub_pack_id`, `title`, `description`, `video_url`, `thumbnail_url`, `duration`, `available_at`, `order_index`, `views`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'مقدمة في تقنيات الدراسة', 'كيفية البدء بخطة دراسية فعالة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '15:30', NULL, 1, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(2, 1, 'تنظيم الوقت للدراسة', 'إدارة الوقت بكفاءة أثناء الدراسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '12:45', NULL, 2, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(3, 1, 'تقنيات الحفظ والاستيعاب', 'طرق فعالة لحفظ المعلومات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:20', NULL, 3, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(7, 8, 'الدراسة الذكية', 'كيفية الدراسة بذكاء وليس بجهد أكبر', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:25', NULL, 1, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(8, 8, 'بناء عادات دراسية', 'تكوين عادات دراسية إيجابية ومستدامة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '15:40', NULL, 2, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(9, 2, 'أسس الثقة بالنفس', 'فهم مفهوم الثقة بالنفس وأهميتها', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:15', NULL, 1, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(10, 2, 'التغلب على الشك الذاتي', 'كيفية محاربة الأفكار السلبية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:30', NULL, 2, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(11, 2, 'بناء الثقة التدريجي', 'خطوات عملية لبناء الثقة بالنفس', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:45', NULL, 3, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(12, 4, 'الثقة في اتخاذ القرارات', 'كيفية اتخاذ قرارات واثقة ومدروسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:20', NULL, 1, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(13, 4, 'التعامل مع النقد', 'كيفية التعامل مع النقد بثقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '14:50', NULL, 2, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(14, 4, 'الثقة في التواصل', 'مهارات التواصل الواثق مع الآخرين', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:35', NULL, 3, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(15, 19, 'الثقة الراسخة', 'بناء ثقة قوية وغير قابلة للهز', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '21:10', NULL, 1, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(16, 19, 'الثقة في المواقف الصعبة', 'الحفاظ على الثقة في الظروف الصعبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:45', NULL, 2, 0, 'active', '2025-09-27 17:05:48', '2025-09-27 17:05:48'),
(17, 6, 'فهم الغضب', 'ما هو الغضب وكيف يؤثر علينا', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '14:20', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(18, 6, 'تقنيات التهدئة الفورية', 'طرق سريعة للتحكم في الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '12:30', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(19, 6, 'إدارة الغضب طويل المدى', 'استراتيجيات للسيطرة المستمرة على الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:40', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(20, 7, 'السيطرة على الغضب المتقدمة', 'تقنيات متقدمة لإدارة الانفعالات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:15', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(21, 7, 'الغضب والعلاقات', 'كيفية إدارة الغضب في العلاقات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '15:25', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(22, 10, 'الغضب في المراهقة', 'إدارة الغضب في فترة المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:30', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(23, 10, 'تقنيات التنفس للغضب', 'استخدام التنفس لتهدئة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '13:45', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(24, 13, 'غضب الأم الجديدة', 'إدارة التوتر والغضب كأم جديدة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:20', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(25, 13, 'الصبر في الأمومة', 'تطوير الصبر مع الأطفال', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:30', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(26, 16, 'الغضب والذكاء العاطفي', 'استخدام الذكاء العاطفي في إدارة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:45', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(27, 16, 'التحكم في ردود الأفعال', 'كيفية السيطرة على ردود الأفعال الغاضبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '14:55', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(28, 21, 'الثقة في إدارة الغضب', 'بناء الثقة في قدرتك على إدارة المشاعر', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:40', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(29, 21, 'الغضب والثقة بالنفس', 'العلاقة بين الغضب والثقة بالنفس', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '15:20', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(30, 23, 'القوة الذهنية ضد الغضب', 'استخدام القوة الذهنية للتحكم في الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:50', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(31, 23, 'تقنيات التأمل للغضب', 'التأمل كأداة لإدارة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:15', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(32, 3, 'أساسيات التربية النفسية', 'مبادئ التربية النفسية الصحيحة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '22:30', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(33, 3, 'فهم نفسية الطفل', 'كيفية فهم احتياجات الطفل النفسية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:45', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(34, 3, 'بناء الشخصية السليمة', 'تنمية شخصية الطفل بطريقة صحية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:15', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(35, 9, 'مواجهة التحديات', 'كيفية التعامل مع تحديات الحياة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:30', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(36, 9, 'بناء المرونة النفسية', 'تطوير القدرة على التأقلم مع الضغوط', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759007848_7690.png', '16:20', '2025-09-27 09:00:00', 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 21:17:30'),
(37, 9, 'النجاح رغم الصعوبات', 'تحقيق الأهداف في الظروف الصعبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:45', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(38, 12, 'تحديات المراهقة', 'مواجهة التحديات الخاصة بفترة المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:15', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(39, 12, 'بناء الشخصية القوية', 'تكوين شخصية قادرة على المواجهة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:30', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(40, 15, 'التوازن في الأمومة', 'التوازن بين الأمومة والحياة الشخصية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:40', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(41, 15, 'تحديات الأم العاملة', 'مواجهة تحديات الأم العاملة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:25', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(42, 18, 'الذكاء العاطفي في التحديات', 'استخدام الذكاء العاطفي لمواجهة الصعوبات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:50', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(43, 18, 'التحكم في الضغوط', 'إدارة الضغوط النفسية بفعالية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '16:35', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(44, 20, 'الثقة في مواجهة الصعوبات', 'بناء الثقة لمواجهة تحديات الحياة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:15', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(45, 20, 'تحويل التحديات لفرص', 'كيفية رؤية الفرص في التحديات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:20', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(46, 22, 'التطور الذهني', 'تطوير القدرات الذهنية لمواجهة التحديات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '21:30', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(47, 22, 'القوة الداخلية', 'اكتشاف وتنمية القوة الداخلية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:10', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(48, 11, 'فهم فترة المراهقة', 'التغيرات الجسدية والنفسية في المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:25', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(49, 11, 'التواصل مع المراهق', 'كيفية التواصل الفعال مع المراهقين', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '17:40', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(50, 11, 'مساعدة المراهق على النمو', 'دعم النمو الصحي للمراهق', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:55', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(51, 14, 'الاستعداد للأمومة', 'التحضير النفسي والعملي للأمومة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '23:15', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(52, 14, 'العناية بالرضيع', 'أساسيات العناية بالطفل الرضيع', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '21:30', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(53, 14, 'التعامل مع تغييرات الأمومة', 'التأقلم مع التغيرات الجديدة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:45', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(54, 17, 'مفهوم الذكاء العاطفي', 'فهم الذكاء العاطفي وأهميته', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '22:10', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(55, 17, 'تطوير المهارات العاطفية', 'تنمية القدرات العاطفية والاجتماعية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '20:35', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(56, 17, 'الذكاء العاطفي في العلاقات', 'استخدام الذكاء العاطفي في العلاقات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:50', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(57, 24, 'فهم سلوك الطفل العنيد', 'أسباب العناد عند الأطفال', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '19:20', NULL, 1, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(58, 24, 'استراتيجيات التعامل', 'طرق فعالة للتعامل مع الطفل العنيد', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '21:45', NULL, 2, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(59, 24, 'تحويل العناد لإيجابية', 'كيفية توجيه عناد الطفل بطريقة إيجابية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '18:30', NULL, 3, 0, 'active', '2025-09-27 17:05:49', '2025-09-27 17:05:49'),
(60, 5, 'TEST', 'TEST', 'https://spadadibattaglia.com/mom/api/video/VID_20250928_083903_759.mp4', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759046175_1168.png', '18:36', '2025-09-28 08:00:00', 0, 0, 'active', '2025-09-28 07:54:04', '2025-09-28 07:56:18');

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

--
-- Dumping data for table `mom_track_visitors`
--


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

--
-- Dumping data for table `mom_users`
--

INSERT INTO `mom_users` (`id`, `name`, `email`, `password`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@spadadibattaglia.com', '$2y$10$2psLI86YUvqcc8Db7OByKe9whptKeOA9uHXxleRYTFrZlngvPoFme', NULL, 'admin', 'active', '2025-09-14 13:34:36', '2025-09-14 18:36:44'),
(2, 'okdeded', 'default@example.com', '$2y$10$2psLI86YUvqcc8Db7OByKe9whptKeOA9uHXxleRYTFrZlngvPoFme', NULL, 'client', 'active', '2025-09-14 18:36:26', '2025-09-14 18:36:26'),
(3, 'Kaufland', 'de2fault@example.com', '$2y$10$ZVLP8Z4zo6yjm5qXO4AQHeZMLXZKOM/Q3ghU077IHe8PRXmdp9sAu', NULL, 'client', 'active', '2025-09-27 16:29:40', '2025-09-27 16:29:40'),
(4, 'Kaufland', 'maman@example.xn--cp-pka', '$2y$10$QxM3Jhy9flGDO7ARKO93Ae1SD/XVwz2./bYoMypIPSnRGcxblXA6K', '222222222', 'client', 'active', '2025-09-27 16:35:16', '2025-09-27 16:35:16'),
(5, 'Kaufland', 'admin@momo.com', '$2y$10$fOMd44dTw2KXyeTM4bZC9.csWeqFliZhVpxkWDBWdnEaXAAW7f4la', '22212322', 'client', 'active', '2025-09-27 16:45:45', '2025-09-27 16:45:45'),
(6, 'Kaufland', 'def2ault@example.com', '$2y$10$xoFFIQbdKXI9Np1WYwepnOZlY2LZswDMFnIkBVDYl.0CTmxKmoi/S', '+21650000001', 'client', 'active', '2025-09-27 16:49:15', '2025-09-27 16:49:15'),
(7, 'Kaufland', 'defau22aalt@example.com', '$2y$10$xjHKdTPT1nK9XRXwUy9iN.0XBeaI/O8ZLnvpEfTUxym9wsRNs3626', '2222222', 'client', 'active', '2025-09-27 17:21:28', '2025-09-27 17:21:28'),
(8, 'Kaufland', 'aaadefault@example.com', '$2y$10$p.ZSFs5zSqMzPRdjzae/YuBjc4bnCI2YwdNXGsBGKDPgw70efhNnK', 'EDE', 'client', 'active', '2025-09-27 17:31:04', '2025-09-27 17:31:04'),
(10, 'deaedad dae', 'dedada@fooer.com', '$2y$10$/jVOsSU1Wm1Mw8Mh./t0X./Oiku23Dx6cZePjAoe0PrHGfmdaYQFu', NULL, 'client', 'active', '2025-09-27 22:18:16', '2025-09-27 22:18:16'),
(11, 'deaedad dae', 'ae2dazada@azkldada.com', '$2y$10$DN3SimIolMB8qklafXu0dOk2LkCL8NHsrx8.p9Iaat1glKQRgZFR.', NULL, 'client', 'active', '2025-09-28 06:07:55', '2025-09-28 06:07:55'),
(12, 'dad ae a da', 'alp2aaha@gmail.om', '$2y$10$6.hzcgEpYgliOVVbFz4rp.gmCPtmUEJ4pNHk4qhR65GLQ92oB.0D2', NULL, 'client', 'active', '2025-09-28 06:53:29', '2025-09-28 06:53:29'),
(13, 'dad ae a da', 'alp2222ha@gmail.om', '$2y$10$2lKrJyZFeHC30gJ0txxNVOKEKhPnUf7QwAvXGtKc4h/6wvwTZcdA.', NULL, 'client', 'active', '2025-09-28 06:55:00', '2025-09-28 06:55:00'),
(14, 'oliverhaninede22', 'oliverhaninede2@draminesaid.com', '$2y$10$FrOTN/A.37mhpUBroFyv1.Uh0L6F1f7FNJp9o8aimWlW7NaOo.rqa', NULL, 'client', 'active', '2025-09-28 08:22:14', '2025-09-28 08:22:14'),
(15, 'Amira hosni', 'amira@draminesaid.com', '$2y$10$bLQ20YY.KOIf8MREgXwTAOQMXNCGcf/Mfo8wDDjFUNJdjMGv8Gffi', '+21654754704', 'client', 'active', '2025-09-28 08:51:36', '2025-09-28 08:51:36'),
(16, 'client amira', 'client@gmail.com', '$2y$10$GYS3BtvZo6RMAmU7jAHbEeilfDNkn6KgND3ypFUADGb0QABQpotTa', '+216262547125', 'client', 'active', '2025-09-28 11:38:11', '2025-09-28 11:38:11'),
(17, 'Iheb chbbi', 'fatma_albeakim@hotmail.com', '$2y$10$6gIDxot1MJCGSqgdM7uuIuG0TCK3keCf1mJ3.M3O0hr.gJZzgaCw2', '+216252345555', 'client', 'active', '2025-09-28 13:07:26', '2025-09-28 13:07:26'),
(18, 'Kaufland', 'default@examplae.com', '$2y$10$Nhb7cO31mQYBAquZZbR4MO1F404j2uEAuqDIxugyKF3peuGB3rXKa', '+216221231231', 'client', 'active', '2025-09-29 07:14:25', '2025-09-29 07:14:25'),
(19, 'dazdad azda', 'admin@ex22aample.com', '$2y$10$Os2GcxkDoTF3wdwRCQbOPuD284WnMkacpp8K5VrMBrLCg.ERO99NW', '+21622132133', 'client', 'active', '2025-09-29 08:35:44', '2025-09-29 08:35:44'),
(20, 'dedeed aa', 'aadedmin@exa2mple.com', '$2y$10$vTiD1BZWZXA8rlzwN0dyne1t8IjwySRLZfwUAyIzAQCbqhTgOhOAS', '+216222131312', 'client', 'active', '2025-09-29 08:45:54', '2025-09-29 08:45:54'),
(21, 'adaz', 'gharbi@respi22zenmedical.com', '$2y$10$iGlsISNIzlPYXK/4xzEHl.ZJ7l8jHYrRCO.c6Xxl839ND6mX/wMx.', '+216222222222', 'client', 'active', '2025-09-30 14:48:49', '2025-09-30 14:48:49'),
(22, 'addad addad', 'addad@gmail.com', '$2y$10$VDbD0A5RhpQdcJDINe.0ceZ1TfxIDOMKehyx7fi9YB/rB7kz0Y1oG', '+21622222222', 'client', 'active', '2025-10-03 06:56:04', '2025-10-03 06:56:04'),
(23, 'adaz', 'gharbi@respizenmedical.com', '$2y$10$zLGpSssdLTl2QkXMPv/HNeH27z3OWQESiCQVf.DMnaxpYPcI1yuRa', '+21622222222', 'client', 'active', '2025-10-03 06:58:25', '2025-10-03 06:58:25');

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

--
-- Dumping data for table `mom_workshops`
--

INSERT INTO `mom_workshops` (`id`, `title`, `description`, `duration`, `type`, `next_date`, `enrolled_count`, `max_participants`, `location`, `highlights`, `price`, `image_url`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ورشة نزع الحفاظ في 3 أيام', 'طريقة عملية وفعالة لتدريب الطفل على استخدام الحمام خلال 3 أيام فقط', '3 أيام متتالية', 'ورشة مكثفة', '2024-10-15', 45, 50, 'الرياض - مركز التدريب الرئيسي', '[\"خطة عملية مجربة ومضمونة\", \"متابعة يومية مع المدربة\", \"دليل شامل للتطبيق\", \"جلسة استشارية مجانية\"]', 299.00, NULL, 'active', '2025-09-14 18:33:39', '2025-09-27 19:52:59'),
(2, 'ورشة سنة أولى أمومة', 'دليل شامل للأمهات الجدد لفهم احتياجات الطفل والتعامل مع تحديات السنة الأولى', '5 أيام', 'ورشة شاملة', '2024-10-22', 32, 50, 'جدة - مركز الأمومة والطفولة', '[\"فهم نمو الطفل الرضيع\", \"تقنيات الرضاعة والنوم\", \"التعامل مع البكاء المستمر\", \"مجموعة دعم للأمهات الجدد\"]', 399.00, NULL, 'active', '2025-09-14 18:33:39', '2025-09-14 18:33:39'),
(3, 'ورشة إدارة نوبات الغضب عند الأطفال', 'تعلمي كيفية التعامل مع نوبات الغضب والتحكم في سلوك الطفل بطريقة إيجابية وفعالة', '4 أيام', 'ورشة تفاعلية', '2024-10-29', 38, 50, 'الدمام - مركز التطوير الأسري', '[\"فهم أسباب نوبات الغضب\", \"تقنيات التهدئة السريعة\", \"استراتيجيات الوقاية\", \"بناء التواصل الإيجابي مع الطفل\"]', 349.00, NULL, 'active', '2025-09-14 18:33:39', '2025-09-14 18:33:39');

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

--
-- Dumping data for table `mom_workshop_requests`
--

INSERT INTO `mom_workshop_requests` (`id`, `user_id`, `workshop_id`, `status`, `admin_notes`, `recu_link`, `created_at`, `admin_response_date`) VALUES
(1, 23, 1, 'pending', '', 'https://spadadibattaglia.com/mom/api/uploads/images/image_1759477008_6263.png', '2025-10-03 07:29:57', NULL);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mom_challenge_requests`
--
ALTER TABLE `mom_challenge_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `mom_challenge_videos`
--
ALTER TABLE `mom_challenge_videos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mom_packs`
--
ALTER TABLE `mom_packs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `mom_requests`
--
ALTER TABLE `mom_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `mom_sub_pack_requests`
--
ALTER TABLE `mom_sub_pack_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mom_sub_pack_videos`
--
ALTER TABLE `mom_sub_pack_videos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `mom_track_visitors`
--
ALTER TABLE `mom_track_visitors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1135;

--
-- AUTO_INCREMENT for table `mom_users`
--
ALTER TABLE `mom_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `mom_workshops`
--
ALTER TABLE `mom_workshops`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mom_workshop_requests`
--
ALTER TABLE `mom_workshop_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
