-- Create promotions table
CREATE TABLE IF NOT EXISTS `mom_promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pack_ids` JSON NOT NULL COMMENT 'Array of pack IDs that have this promotion',
  `discount_percentage` decimal(5,2) NOT NULL COMMENT 'Discount percentage (0-100)',
  `description` text DEFAULT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
