-- Create workshop requests table
CREATE TABLE IF NOT EXISTS mom_workshop_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workshop_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    recu_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_response_date TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES mom_users(id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_id) REFERENCES mom_workshops(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_workshop (user_id, workshop_id)
);

-- Create workshop videos table
CREATE TABLE IF NOT EXISTS mom_workshop_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(50),
    order_index INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workshop_id) REFERENCES mom_workshops(id) ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX idx_workshop_id ON mom_workshop_videos (workshop_id);
CREATE INDEX idx_status ON mom_workshop_videos (status);
CREATE INDEX idx_workshop_request_status ON mom_workshop_requests (status);
CREATE INDEX idx_workshop_request_user ON mom_workshop_requests (user_id);
