-- Create mom_pack_challenge_links table to link packs with challenges
CREATE TABLE IF NOT EXISTS mom_pack_challenge_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pack_id INT NOT NULL,
    challenge_id INT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pack_challenge (pack_id, challenge_id),
    KEY pack_id (pack_id),
    KEY challenge_id (challenge_id),
    FOREIGN KEY (pack_id) REFERENCES mom_packs(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES mom_challenges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
