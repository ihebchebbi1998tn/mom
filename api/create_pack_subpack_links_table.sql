-- Create junction table for many-to-many relationship between packs and sub_packs
CREATE TABLE IF NOT EXISTS `mom_pack_sub_pack_links` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `pack_id` int(11) NOT NULL,
    `sub_pack_id` int(11) NOT NULL,
    `order_index` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_pack_sub_pack` (`pack_id`, `sub_pack_id`),
    KEY `pack_id` (`pack_id`),
    KEY `sub_pack_id` (`sub_pack_id`),
    FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sub_pack_id`) REFERENCES `mom_sub_packs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: After running this migration, run migrate_pack_subpack_data.php to populate the junction table
-- Then you can optionally remove the pack_id column from mom_sub_packs table if desired
