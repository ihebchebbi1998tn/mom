-- Create pack_challenge_links table to link challenges with sub-packs
CREATE TABLE IF NOT EXISTS pack_challenge_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    sub_pack_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_pack_id) REFERENCES sub_packs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_challenge_subpack (challenge_id, sub_pack_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster queries
CREATE INDEX idx_challenge_id ON pack_challenge_links(challenge_id);
CREATE INDEX idx_sub_pack_id ON pack_challenge_links(sub_pack_id);
