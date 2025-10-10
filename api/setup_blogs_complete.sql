-- Complete setup for blogs table
-- Run this file in your MySQL/phpMyAdmin to fix the issue

-- Step 1: Drop existing table if it has wrong structure
DROP TABLE IF EXISTS blogs;

-- Step 2: Create blogs table with correct structure
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
    
    INDEX idx_status (status),
    INDEX idx_published_date (published_date),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);

-- Step 3: Insert sample blog post for testing
INSERT INTO blogs (title, excerpt, content, category, author, published_date, read_time, views, likes, featured_image, status) VALUES
(
    'مرحباً بكم في مدونة أكاديمية الأم',
    'هذه مقالة تجريبية لاختبار نظام المدونة',
    'مرحباً بكم في مدونة أكاديمية الأم الإلكترونية. هنا سنشارك معكم محتوى مفيد وقيم حول التربية والأمومة.

## عن المدونة

هذه المدونة مخصصة لمشاركة المعرفة والخبرات في مجال التربية والأمومة.

## المواضيع

سنغطي مواضيع متنوعة مثل:
- التربية الإيجابية
- تطوير الطفل
- إدارة الوقت للأمهات
- الصحة النفسية

نتمنى أن تجدوا المحتوى مفيداً ومثرياً.',
    'عام',
    'أكاديمية الأم',
    '2025-10-03',
    '3 دقائق',
    0,
    0,
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop',
    'published'
);
