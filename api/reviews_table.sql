-- Create reviews table
CREATE TABLE IF NOT EXISTS mom_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES mom_users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_reviews_user_id ON mom_reviews(user_id);
CREATE INDEX idx_reviews_rating ON mom_reviews(rating);
CREATE INDEX idx_reviews_status ON mom_reviews(status);
CREATE INDEX idx_reviews_created_at ON mom_reviews(created_at);

-- Insert some sample reviews for testing
INSERT INTO mom_reviews (user_id, user_name, user_email, rating, review_text, status) VALUES
(1, 'Admin', 'admin@spadadibattaglia.com', 5, 'خدمة ممتازة جداً، ساعدتني كثيراً في تطوير شخصيتي وثقتي بنفسي. أنصح الجميع بالتجربة', 'approved'),
(1, 'سارة أحمد', 'sara@example.com', 5, 'الدورات مفيدة جداً وطريقة التعليم رائعة. تعلمت الكثير من المهارات المهمة', 'approved'),
(1, 'فاطمة محمد', 'fatima@example.com', 4, 'تجربة جيدة جداً، المحتوى قيم والمدربة متمكنة. أتطلع للمزيد من الدورات', 'approved'),
(1, 'نور الهدى', 'nour@example.com', 5, 'ساعدني البرنامج كثيراً في التعامل مع التحديات اليومية. شكراً لكم', 'approved'),
(1, 'ليلى حسن', 'layla@example.com', 4, 'دورات مفيدة ومحتوى غني. التطبيق العملي للمفاهيم كان الأهم', 'approved');