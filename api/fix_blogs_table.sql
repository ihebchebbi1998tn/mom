-- Drop existing table if structure is wrong
DROP TABLE IF EXISTS blogs;

-- Blog posts table for dynamic content management
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'أكاديمية الأم',
    published_date DATE NOT NULL,
    read_time VARCHAR(20) DEFAULT '5 دقائق',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    featured_image VARCHAR(500),
    status ENUM('published', 'draft') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_status (status),
    INDEX idx_published_date (published_date),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);
