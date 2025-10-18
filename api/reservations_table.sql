-- Create mom_reservations table
CREATE TABLE IF NOT EXISTS `mom_reservations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL,
    `client_name` varchar(255) NOT NULL,
    `client_phone` varchar(20) DEFAULT NULL,
    `status` enum('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    `notes` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_date` (`date`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;