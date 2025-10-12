-- Create junction table for pack-workshop relationships (many-to-many)
CREATE TABLE IF NOT EXISTS `mom_pack_workshop_links` (
    `id` int NOT NULL AUTO_INCREMENT,
    `pack_id` int NOT NULL,
    `workshop_id` int NOT NULL,
    `order_index` int NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_pack_workshop` (`pack_id`, `workshop_id`),
    KEY `pack_id` (`pack_id`),
    KEY `workshop_id` (`workshop_id`),
    FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`workshop_id`) REFERENCES `mom_workshops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create junction table for pack-challenge relationships (many-to-many)
CREATE TABLE IF NOT EXISTS `mom_pack_challenge_links` (
    `id` int NOT NULL AUTO_INCREMENT,
    `pack_id` int NOT NULL,
    `challenge_id` int NOT NULL,
    `order_index` int NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_pack_challenge` (`pack_id`, `challenge_id`),
    KEY `pack_id` (`pack_id`),
    KEY `challenge_id` (`challenge_id`),
    FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`challenge_id`) REFERENCES `mom_challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
