-- Complete Pack-SubPack Migration Script
-- Run this script directly in your database to:
-- 1. Create the junction table
-- 2. Populate it with all pack-subpack relationships

-- Step 1: Create junction table
CREATE TABLE IF NOT EXISTS `mom_pack_sub_pack_links` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `pack_id` int(11) NOT NULL,
    `sub_pack_id` int(11) NOT NULL,
    `order_index` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_pack_sub_pack` (`pack_id`, `sub_pack_id`),
    KEY `pack_id` (`pack_id`),
    KEY `sub_pack_id` (`sub_pack_id`),
    FOREIGN KEY (`pack_id`) REFERENCES `mom_packs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sub_pack_id`) REFERENCES `mom_sub_packs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Populate junction table with pack-subpack relationships
INSERT INTO `mom_pack_sub_pack_links` (`pack_id`, `sub_pack_id`, `order_index`) VALUES
-- Pack 1: الدراسي 1 (دورة الدراسة, دورة الثقة بالنفس, دورة التربية الجنسية)
(1, 4, 1),  -- دورة الدراسة
(1, 3, 2),  -- دورة الثقة بالنفس
(1, 8, 3),  -- دورة التربية الجنسية

-- Pack 2: الدراسي 2 (دورة الثقة بالنفس, دورة الدراسة, دورة السيطرة على الغضب)
(2, 3, 1),  -- دورة الثقة بالنفس
(2, 4, 2),  -- دورة الدراسة
(2, 1, 3),  -- دورة السيطرة على الغضب

-- Pack 3: الدراسي 3 (دورة السيطرة على الغضب, دورة الدراسة, دورة تحدي الحياة)
(3, 1, 1),  -- دورة السيطرة على الغضب
(3, 4, 2),  -- دورة الدراسة
(3, 10, 3), -- دورة تحدي الحياة

-- Pack 4: المراهقة (السيطرة على الغضب, دورة المراهقة, تحدي الحياة)
(4, 1, 1),  -- السيطرة على الغضب
(4, 12, 2), -- دورة المراهقة
(4, 9, 3),  -- تحدي الحياة

-- Pack 5: الأم الجديدة (السيطرة على الغضب, سنة أولى أمومة, تحدي الحياة)
(5, 1, 1),  -- السيطرة على الغضب
(5, 7, 2),  -- سنة أولى أمومة
(5, 9, 3),  -- تحدي الحياة

-- Pack 6: الذكاء العاطفي (السيطرة على الغضب, الذكاء العاطفي, تحدي الحياة)
(6, 1, 1),  -- السيطرة على الغضب
(6, 5, 2),  -- الذكاء العاطفي
(6, 9, 3),  -- تحدي الحياة

-- Pack 7: الثقة (دورة الثقة بالنفس, دورة تحدي الحياة, دورة السيطرة على الغضب)
(7, 3, 1),  -- دورة الثقة بالنفس
(7, 10, 2), -- دورة تحدي الحياة
(7, 1, 3),  -- دورة السيطرة على الغضب

-- Pack 8: الذهني (دورة تحدي الحياة, دورة السيطرة على الغضب, دورة الطفل العنيد)
(8, 10, 1), -- دورة تحدي الحياة
(8, 1, 2),  -- دورة السيطرة على الغضب
(8, 2, 3)   -- دورة الطفل العنيد
ON DUPLICATE KEY UPDATE order_index = VALUES(order_index);

-- Migration complete!
