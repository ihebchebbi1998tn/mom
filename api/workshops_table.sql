-- Create workshops table
CREATE TABLE IF NOT EXISTS mom_workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'ورشة تدريبية',
    next_date DATE NOT NULL,
    enrolled_count INT DEFAULT 0,
    max_participants INT DEFAULT 50,
    location VARCHAR(255) NOT NULL,
    highlights JSON,
    price DECIMAL(10,2) DEFAULT 0.00,
    image_url VARCHAR(500),
    status ENUM('active', 'inactive', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default workshops
INSERT INTO mom_workshops (title, description, duration, type, next_date, enrolled_count, location, highlights, price) VALUES
('ورشة نزع الحفاظ في 3 أيام', 'طريقة عملية وفعالة لتدريب الطفل على استخدام الحمام خلال 3 أيام فقط', '3 أيام متتالية', 'ورشة مكثفة', '2024-10-15', 45, 'الرياض - مركز التدريب الرئيسي', JSON_ARRAY('خطة عملية مجربة ومضمونة', 'متابعة يومية مع المدربة', 'دليل شامل للتطبيق', 'جلسة استشارية مجانية'), 299.00),
('ورشة سنة أولى أمومة', 'دليل شامل للأمهات الجدد لفهم احتياجات الطفل والتعامل مع تحديات السنة الأولى', '5 أيام', 'ورشة شاملة', '2024-10-22', 32, 'جدة - مركز الأمومة والطفولة', JSON_ARRAY('فهم نمو الطفل الرضيع', 'تقنيات الرضاعة والنوم', 'التعامل مع البكاء المستمر', 'مجموعة دعم للأمهات الجدد'), 399.00),
('ورشة إدارة نوبات الغضب عند الأطفال', 'تعلمي كيفية التعامل مع نوبات الغضب والتحكم في سلوك الطفل بطريقة إيجابية وفعالة', '4 أيام', 'ورشة تفاعلية', '2024-10-29', 38, 'الدمام - مركز التطوير الأسري', JSON_ARRAY('فهم أسباب نوبات الغضب', 'تقنيات التهدئة السريعة', 'استراتيجيات الوقاية', 'بناء التواصل الإيجابي مع الطفل'), 349.00);