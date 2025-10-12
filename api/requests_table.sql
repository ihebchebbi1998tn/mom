-- Create purchase requests table
CREATE TABLE IF NOT EXISTS mom_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pack_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_response_date TIMESTAMP NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES mom_users(id) ON DELETE CASCADE,
    FOREIGN KEY (pack_id) REFERENCES mom_packs(id) ON DELETE CASCADE,
    
    -- Prevent duplicate requests
    UNIQUE KEY unique_user_pack (user_id, pack_id)
);

-- Add indexes for better performance
CREATE INDEX idx_requests_user_id ON mom_requests(user_id);
CREATE INDEX idx_requests_pack_id ON mom_requests(pack_id);
CREATE INDEX idx_requests_status ON mom_requests(status);