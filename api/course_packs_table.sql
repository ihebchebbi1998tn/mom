-- Create mom_packs table
CREATE TABLE IF NOT EXISTS `mom_packs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `modules` text NOT NULL,
    `price` varchar(100) NOT NULL,
    `duration` varchar(100) NOT NULL,
    `students` varchar(50) NOT NULL DEFAULT '0+',
    `rating` decimal(2,1) NOT NULL DEFAULT 5.0,
    `image_url` text DEFAULT NULL,
    `description` text DEFAULT NULL,
    `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create mom_sub_packs table
CREATE TABLE IF NOT EXISTS `mom_sub_packs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `pack_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `order_index` int(11) NOT NULL DEFAULT 0,
    `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `pack_id` (`pack_id`),
    FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create mom_sub_pack_videos table
CREATE TABLE IF NOT EXISTS `mom_sub_pack_videos` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `sub_pack_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `video_url` text NOT NULL,
    `duration` varchar(20) DEFAULT NULL,
    `order_index` int(11) NOT NULL DEFAULT 0,
    `views` int(11) NOT NULL DEFAULT 0,
    `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `sub_pack_id` (`sub_pack_id`),
    FOREIGN KEY (`sub_pack_id`) REFERENCES `mom_sub_packs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO `mom_packs` (`title`, `modules`, `price`, `duration`, `students`, `rating`, `image_url`, `description`) VALUES
('الباك الدراسي 1', 'سيطرة عالغضب,دراسة,تحدي الحياة 21 يوم', '299 TND', '4 أسابيع', '150+', 4.9, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center', 'باك دراسي شامل لتطوير المهارات الأساسية'),
('الباك الدراسي 2', 'سيطرة عالغضب,دراسة,ثقة في النفس', '349 TND', '5 أسابيع', '120+', 4.8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center', 'باك متقدم لبناء الثقة والمهارات الدراسية'),
('الباك الدراسي 3', 'دراسة,ثقة في النفس,تربية جنسية', '399 TND', '6 أسابيع', '95+', 4.9, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&crop=center', 'باك شامل للتطوير الشخصي والدراسي'),
('باك المراهقة', 'سيطرة عالغضب,مراهقة,تحدي الحياة', '449 TND', '6 أسابيع', '85+', 4.7, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop&crop=center', 'باك مخصص لفترة المراهقة وتحدياتها'),
('باك الثقة في النفس', 'سيطرة عالغضب,ثقة في النفس,تحدي الحياة', '379 TND', '5 أسابيع', '140+', 4.8, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop&crop=center', 'باك لبناء الثقة بالنفس والتطوير الذاتي'),
('باك تغيير الحياة', 'تحدي الحياة مستوى 1,مستوى 2,مستوى 3 (مناهجية)', '599 TND', '8 أسابيع', '75+', 4.9, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop&crop=center', 'باك شامل لتغيير نمط الحياة والتطوير الكامل');