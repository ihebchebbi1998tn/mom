-- Create consultation_availability table
CREATE TABLE IF NOT EXISTS `consultation_availability` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL UNIQUE,
    `status` enum('available', 'full', 'unavailable') NOT NULL DEFAULT 'available',
    `notes` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;