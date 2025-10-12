-- Test Data Inserts for Mom Packs System
-- Clear existing test data first
DELETE FROM `mom_sub_pack_videos` WHERE 1;
DELETE FROM `mom_sub_packs` WHERE 1;
DELETE FROM `mom_packs` WHERE 1;

-- Reset auto increment
ALTER TABLE `mom_packs` AUTO_INCREMENT = 1;
ALTER TABLE `mom_sub_packs` AUTO_INCREMENT = 1;
ALTER TABLE `mom_sub_pack_videos` AUTO_INCREMENT = 1;

-- Insert Mom Packs with TND pricing
INSERT INTO `mom_packs` (`title`, `modules`, `price`, `duration`, `students`, `rating`, `image_url`, `description`, `status`) VALUES
('الدراسي 1', 'دورة الدراسة,دورة الثقة بالنفس,دورة التربية النفسية', '299 TND', '4 أسابيع', '150+', 4.9, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center', 'باك دراسي شامل لتطوير المهارات الأساسية والثقة بالنفس', 'active'),
('الدراسي 2', 'دورة الثقة بالنفس,دورة الدراسة,دورة السيطرة على الغضب', '349 TND', '5 أسابيع', '120+', 4.8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center', 'باك متقدم لبناء الثقة والمهارات الدراسية مع إدارة الغضب', 'active'),
('الدراسي 3', 'دورة السيطرة على الغضب,دورة الدراسة,دورة تحدي الحياة', '399 TND', '6 أسابيع', '95+', 4.9, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&crop=center', 'باك شامل للتطوير الشخصي والدراسي مع تحديات الحياة', 'active'),
('المراهقة', 'السيطرة على الغضب,دورة المراهقة,تحدي الحياة', '449 TND', '6 أسابيع', '85+', 4.7, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop&crop=center', 'باك مخصص لفترة المراهقة وتحدياتها مع إدارة الغضب', 'active'),
('الأم الجديدة', 'السيطرة على الغضب,سنة أولى أمومة,تحدي الحياة', '479 TND', '7 أسابيع', '140+', 4.8, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop&crop=center', 'باك مخصص للأمهات الجدد لإدارة التحديات والغضب', 'active'),
('الذكاء العاطفي', 'السيطرة على الغضب,الذكاء العاطفي,تحدي الحياة', '599 TND', '8 أسابيع', '75+', 4.9, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop&crop=center', 'باك شامل لتطوير الذكاء العاطفي وإدارة المشاعر', 'active'),
('الثقة', 'دورة الثقة بالنفس,دورة تحدي الحياة,دورة السيطرة على الغضب', '379 TND', '5 أسابيع', '160+', 4.8, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=center', 'باك مخصص لبناء الثقة بالنفس ومواجهة تحديات الحياة', 'active'),
('الذهني', 'دورة تحدي الحياة,دورة السيطرة على الغضب,دورة الطفل العنيد', '529 TND', '7 أسابيع', '110+', 4.7, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=center', 'باك للتطوير الذهني وإدارة سلوك الأطفال الصعب', 'active');

-- Insert Sub Packs for Pack 1: الدراسي 1
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(1, 'دورة الدراسة', 'تطوير مهارات الدراسة الفعالة والتركيز', 1),
(1, 'دورة الثقة بالنفس', 'بناء الثقة بالنفس والتغلب على القلق', 2),
(1, 'دورة التربية النفسية', 'فهم النفسية وتطوير الصحة النفسية', 3);

-- Insert Sub Packs for Pack 2: الدراسي 2
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(2, 'دورة الثقة بالنفس', 'تعزيز الثقة بالنفس والقدرة على اتخاذ القرارات', 1),
(2, 'دورة الدراسة', 'تقنيات دراسية متقدمة وإدارة الوقت', 2),
(2, 'دورة السيطرة على الغضب', 'تعلم إدارة الغضب والانفعالات بطريقة صحية', 3);

-- Insert Sub Packs for Pack 3: الدراسي 3
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(3, 'دورة السيطرة على الغضب', 'إتقان فنون التحكم في الغضب والهدوء', 1),
(3, 'دورة الدراسة', 'استراتيجيات دراسية للنجاح الأكاديمي', 2),
(3, 'دورة تحدي الحياة', 'مواجهة تحديات الحياة بثقة وإصرار', 3);

-- Insert Sub Packs for Pack 4: المراهقة
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(4, 'السيطرة على الغضب', 'إدارة الغضب في فترة المراهقة الحساسة', 1),
(4, 'دورة المراهقة', 'فهم تحديات المراهقة والتعامل معها', 2),
(4, 'تحدي الحياة', 'بناء شخصية قوية لمواجهة الحياة', 3);

-- Insert Sub Packs for Pack 5: الأم الجديدة
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(5, 'السيطرة على الغضب', 'إدارة التوتر والغضب كأم جديدة', 1),
(5, 'سنة أولى أمومة', 'دليل شامل للعام الأول من الأمومة', 2),
(5, 'تحدي الحياة', 'التوازن بين الأمومة والحياة الشخصية', 3);

-- Insert Sub Packs for Pack 6: الذكاء العاطفي
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(6, 'السيطرة على الغضب', 'التحكم في الانفعالات عبر الذكاء العاطفي', 1),
(6, 'الذكاء العاطفي', 'تطوير المهارات العاطفية والاجتماعية', 2),
(6, 'تحدي الحياة', 'استخدام الذكاء العاطفي في مواجهة التحديات', 3);

-- Insert Sub Packs for Pack 7: الثقة
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(7, 'دورة الثقة بالنفس', 'بناء الثقة الراسخة بالذات والقدرات', 1),
(7, 'دورة تحدي الحياة', 'الثقة في مواجهة صعوبات الحياة', 2),
(7, 'دورة السيطرة على الغضب', 'الثقة في إدارة المشاعر السلبية', 3);

-- Insert Sub Packs for Pack 8: الذهني
INSERT INTO `mom_sub_packs` (`pack_id`, `title`, `description`, `order_index`) VALUES
(8, 'دورة تحدي الحياة', 'التطور الذهني لمواجهة التحديات', 1),
(8, 'دورة السيطرة على الغضب', 'القوة الذهنية للتحكم في الانفعالات', 2),
(8, 'دورة الطفل العنيد', 'استراتيجيات ذهنية للتعامل مع الطفل العنيد', 3);

-- Insert Sample Videos for each Sub Pack
-- Videos for دورة الدراسة (Sub Pack IDs: 1, 5, 8)
INSERT INTO `mom_sub_pack_videos` (`sub_pack_id`, `title`, `description`, `video_url`, `duration`, `order_index`) VALUES
(1, 'مقدمة في تقنيات الدراسة', 'كيفية البدء بخطة دراسية فعالة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '15:30', 1),
(1, 'تنظيم الوقت للدراسة', 'إدارة الوقت بكفاءة أثناء الدراسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12:45', 2),
(1, 'تقنيات الحفظ والاستيعاب', 'طرق فعالة لحفظ المعلومات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:20', 3),

(5, 'تقنيات دراسية متقدمة', 'استراتيجيات دراسية للمستوى المتقدم', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:15', 1),
(5, 'التركيز العميق', 'كيفية تحقيق التركيز الكامل أثناء الدراسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '14:30', 2),
(5, 'مراجعة فعالة للامتحانات', 'خطط مراجعة ناجحة للامتحانات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '13:50', 3),

(8, 'الدراسة الذكية', 'كيفية الدراسة بذكاء وليس بجهد أكبر', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:25', 1),
(8, 'بناء عادات دراسية', 'تكوين عادات دراسية إيجابية ومستدامة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '15:40', 2);

-- Videos for دورة الثقة بالنفس (Sub Pack IDs: 2, 4, 19)
INSERT INTO `mom_sub_pack_videos` (`sub_pack_id`, `title`, `description`, `video_url`, `duration`, `order_index`) VALUES
(2, 'أسس الثقة بالنفس', 'فهم مفهوم الثقة بالنفس وأهميتها', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:15', 1),
(2, 'التغلب على الشك الذاتي', 'كيفية محاربة الأفكار السلبية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:30', 2),
(2, 'بناء الثقة التدريجي', 'خطوات عملية لبناء الثقة بالنفس', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:45', 3),

(4, 'الثقة في اتخاذ القرارات', 'كيفية اتخاذ قرارات واثقة ومدروسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:20', 1),
(4, 'التعامل مع النقد', 'كيفية التعامل مع النقد بثقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '14:50', 2),
(4, 'الثقة في التواصل', 'مهارات التواصل الواثق مع الآخرين', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:35', 3),

(19, 'الثقة الراسخة', 'بناء ثقة قوية وغير قابلة للهز', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '21:10', 1),
(19, 'الثقة في المواقف الصعبة', 'الحفاظ على الثقة في الظروف الصعبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:45', 2);

-- Videos for دورة السيطرة على الغضب (Sub Pack IDs: 6, 7, 10, 13, 16, 21, 23)
INSERT INTO `mom_sub_pack_videos` (`sub_pack_id`, `title`, `description`, `video_url`, `duration`, `order_index`) VALUES
(6, 'فهم الغضب', 'ما هو الغضب وكيف يؤثر علينا', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '14:20', 1),
(6, 'تقنيات التهدئة الفورية', 'طرق سريعة للتحكم في الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12:30', 2),
(6, 'إدارة الغضب طويل المدى', 'استراتيجيات للسيطرة المستمرة على الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:40', 3),

(7, 'السيطرة على الغضب المتقدمة', 'تقنيات متقدمة لإدارة الانفعالات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:15', 1),
(7, 'الغضب والعلاقات', 'كيفية إدارة الغضب في العلاقات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '15:25', 2),

(10, 'الغضب في المراهقة', 'إدارة الغضب في فترة المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:30', 1),
(10, 'تقنيات التنفس للغضب', 'استخدام التنفس لتهدئة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '13:45', 2),

(13, 'غضب الأم الجديدة', 'إدارة التوتر والغضب كأم جديدة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:20', 1),
(13, 'الصبر في الأمومة', 'تطوير الصبر مع الأطفال', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:30', 2),

(16, 'الغضب والذكاء العاطفي', 'استخدام الذكاء العاطفي في إدارة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:45', 1),
(16, 'التحكم في ردود الأفعال', 'كيفية السيطرة على ردود الأفعال الغاضبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '14:55', 2),

(21, 'الثقة في إدارة الغضب', 'بناء الثقة في قدرتك على إدارة المشاعر', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:40', 1),
(21, 'الغضب والثقة بالنفس', 'العلاقة بين الغضب والثقة بالنفس', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '15:20', 2),

(23, 'القوة الذهنية ضد الغضب', 'استخدام القوة الذهنية للتحكم في الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:50', 1),
(23, 'تقنيات التأمل للغضب', 'التأمل كأداة لإدارة الغضب', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:15', 2);

-- Videos for remaining sub packs
INSERT INTO `mom_sub_pack_videos` (`sub_pack_id`, `title`, `description`, `video_url`, `duration`, `order_index`) VALUES
-- دورة التربية النفسية (Sub Pack ID: 3)
(3, 'أساسيات التربية النفسية', 'مبادئ التربية النفسية الصحيحة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '22:30', 1),
(3, 'فهم نفسية الطفل', 'كيفية فهم احتياجات الطفل النفسية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:45', 2),
(3, 'بناء الشخصية السليمة', 'تنمية شخصية الطفل بطريقة صحية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:15', 3),

-- دورة تحدي الحياة (Sub Pack IDs: 9, 12, 15, 18, 20, 22)
(9, 'مواجهة التحديات', 'كيفية التعامل مع تحديات الحياة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:30', 1),
(9, 'بناء المرونة النفسية', 'تطوير القدرة على التأقلم مع الضغوط', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:20', 2),
(9, 'النجاح رغم الصعوبات', 'تحقيق الأهداف في الظروف الصعبة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:45', 3),

(12, 'تحديات المراهقة', 'مواجهة التحديات الخاصة بفترة المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:15', 1),
(12, 'بناء الشخصية القوية', 'تكوين شخصية قادرة على المواجهة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:30', 2),

(15, 'التوازن في الأمومة', 'التوازن بين الأمومة والحياة الشخصية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:40', 1),
(15, 'تحديات الأم العاملة', 'مواجهة تحديات الأم العاملة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:25', 2),

(18, 'الذكاء العاطفي في التحديات', 'استخدام الذكاء العاطفي لمواجهة الصعوبات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:50', 1),
(18, 'التحكم في الضغوط', 'إدارة الضغوط النفسية بفعالية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '16:35', 2),

(20, 'الثقة في مواجهة الصعوبات', 'بناء الثقة لمواجهة تحديات الحياة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:15', 1),
(20, 'تحويل التحديات لفرص', 'كيفية رؤية الفرص في التحديات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:20', 2),

(22, 'التطور الذهني', 'تطوير القدرات الذهنية لمواجهة التحديات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '21:30', 1),
(22, 'القوة الداخلية', 'اكتشاف وتنمية القوة الداخلية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:10', 2),

-- دورة المراهقة (Sub Pack ID: 11)
(11, 'فهم فترة المراهقة', 'التغيرات الجسدية والنفسية في المراهقة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:25', 1),
(11, 'التواصل مع المراهق', 'كيفية التواصل الفعال مع المراهقين', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '17:40', 2),
(11, 'مساعدة المراهق على النمو', 'دعم النمو الصحي للمراهق', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:55', 3),

-- سنة أولى أمومة (Sub Pack ID: 14)
(14, 'الاستعداد للأمومة', 'التحضير النفسي والعملي للأمومة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '23:15', 1),
(14, 'العناية بالرضيع', 'أساسيات العناية بالطفل الرضيع', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '21:30', 2),
(14, 'التعامل مع تغييرات الأمومة', 'التأقلم مع التغيرات الجديدة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:45', 3),

-- الذكاء العاطفي (Sub Pack ID: 17)
(17, 'مفهوم الذكاء العاطفي', 'فهم الذكاء العاطفي وأهميته', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '22:10', 1),
(17, 'تطوير المهارات العاطفية', 'تنمية القدرات العاطفية والاجتماعية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '20:35', 2),
(17, 'الذكاء العاطفي في العلاقات', 'استخدام الذكاء العاطفي في العلاقات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:50', 3),

-- دورة الطفل العنيد (Sub Pack ID: 24)
(24, 'فهم سلوك الطفل العنيد', 'أسباب العناد عند الأطفال', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '19:20', 1),
(24, 'استراتيجيات التعامل', 'طرق فعالة للتعامل مع الطفل العنيد', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '21:45', 2),
(24, 'تحويل العناد لإيجابية', 'كيفية توجيه عناد الطفل بطريقة إيجابية', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:30', 3);