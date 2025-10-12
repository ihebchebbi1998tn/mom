-- Create challenges table
CREATE TABLE IF NOT EXISTS mom_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  difficulty ENUM('سهل', 'متوسط', 'صعب') DEFAULT 'متوسط',
  participants INT DEFAULT 0,
  reward VARCHAR(255),
  status ENUM('active', 'upcoming', 'completed') DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  price DECIMAL(10,2) DEFAULT 0.00,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create challenge requests table
CREATE TABLE IF NOT EXISTS mom_challenge_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  recu_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_response_date TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES mom_users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES mom_challenges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);

-- Create challenge videos table
CREATE TABLE IF NOT EXISTS mom_challenge_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration VARCHAR(50),
  order_index INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES mom_challenges(id) ON DELETE CASCADE
);

-- Insert sample challenges from mock data
INSERT INTO mom_challenges (title, description, duration, difficulty, participants, reward, status, start_date, end_date, price) VALUES
('تحدي الأم الواعية - 30 يوم', 'تحدي شامل لتطوير مهارات الأمومة الواعية خلال 30 يوماً من خلال أنشطة يومية وتمارين عملية', '30 يوم', 'متوسط', 156, 'شهادة إنجاز + استشارة مجانية', 'active', '2024-01-01', '2024-01-31', 199.00),
('تحدي إدارة الوقت للأمهات', 'تعلمي كيفية تنظيم وقتك بفعالية بين المسؤوليات المختلفة من خلال تقنيات عملية مجربة', '14 يوم', 'سهل', 89, 'دليل تنظيم الوقت الشخصي', 'upcoming', '2024-02-01', '2024-02-14', 149.00),
('تحدي الذكاء العاطفي', 'رحلة تطوير الذكاء العاطفي لفهم وإدارة المشاعر بطريقة صحية للأم والطفل', '21 يوم', 'صعب', 67, 'برنامج متقدم في الذكاء العاطفي', 'active', '2024-01-15', '2024-02-05', 249.00);
