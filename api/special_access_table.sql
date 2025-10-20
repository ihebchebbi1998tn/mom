-- Table for special manual access grants by admin
CREATE TABLE IF NOT EXISTS mom_special_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sub_pack_id INT NOT NULL,
    granted_by INT NOT NULL COMMENT 'Admin user ID who granted access',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE KEY unique_access (user_id, sub_pack_id),
    FOREIGN KEY (user_id) REFERENCES mom_users(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_pack_id) REFERENCES mom_sub_packs(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES mom_users(id) ON DELETE CASCADE,
    INDEX idx_user_subpack (user_id, sub_pack_id),
    INDEX idx_subpack (sub_pack_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
