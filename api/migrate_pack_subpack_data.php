<?php
/**
 * Data Migration Script: Populate mom_pack_sub_pack_links junction table
 * 
 * This script maps sub_packs to packs based on the modules field in mom_packs
 * Run this ONCE after creating the mom_pack_sub_pack_links table
 */

header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Mapping based on the existing data structure
    $mappings = [
        // Pack 1: الدراسي 1 - modules: "دورة الدراسة,دورة الثقة بالنفس,دورة التربية النفسية"
        ['pack_id' => 1, 'sub_pack_id' => 4, 'order' => 1],  // دورة الدراسة
        ['pack_id' => 1, 'sub_pack_id' => 3, 'order' => 2],  // دورة الثقة بالنفس
        ['pack_id' => 1, 'sub_pack_id' => 8, 'order' => 3],  // دورة التربية الجنسية
        
        // Pack 2: الدراسي 2 - modules: "دورة الثقة بالنفس,دورة الدراسة,دورة السيطرة على الغضب"
        ['pack_id' => 2, 'sub_pack_id' => 3, 'order' => 1],  // دورة الثقة بالنفس
        ['pack_id' => 2, 'sub_pack_id' => 4, 'order' => 2],  // دورة الدراسة
        ['pack_id' => 2, 'sub_pack_id' => 1, 'order' => 3],  // دورة السيطرة على الغضب
        
        // Pack 3: الدراسي 3 - modules: "دورة السيطرة على الغضب,دورة الدراسة,دورة تحدي الحياة"
        ['pack_id' => 3, 'sub_pack_id' => 1, 'order' => 1],  // دورة السيطرة على الغضب
        ['pack_id' => 3, 'sub_pack_id' => 4, 'order' => 2],  // دورة الدراسة
        ['pack_id' => 3, 'sub_pack_id' => 10, 'order' => 3], // دورة تحدي الحياة
        
        // Pack 4: المراهقة - modules: "السيطرة على الغضب,دورة المراهقة,تحدي الحياة"
        ['pack_id' => 4, 'sub_pack_id' => 1, 'order' => 1],  // السيطرة على الغضب
        ['pack_id' => 4, 'sub_pack_id' => 12, 'order' => 2], // دورة المراهقة
        ['pack_id' => 4, 'sub_pack_id' => 9, 'order' => 3],  // تحدي الحياة
        
        // Pack 5: الأم الجديدة - modules: "السيطرة على الغضب,سنة أولى أمومة,تحدي الحياة"
        ['pack_id' => 5, 'sub_pack_id' => 1, 'order' => 1],  // السيطرة على الغضب
        ['pack_id' => 5, 'sub_pack_id' => 7, 'order' => 2],  // سنة أولى أمومة
        ['pack_id' => 5, 'sub_pack_id' => 9, 'order' => 3],  // تحدي الحياة
        
        // Pack 6: الذكاء العاطفي - modules: "السيطرة على الغضب,الذكاء العاطفي,تحدي الحياة"
        ['pack_id' => 6, 'sub_pack_id' => 1, 'order' => 1],  // السيطرة على الغضب
        ['pack_id' => 6, 'sub_pack_id' => 5, 'order' => 2],  // الذكاء العاطفي
        ['pack_id' => 6, 'sub_pack_id' => 9, 'order' => 3],  // تحدي الحياة
        
        // Pack 7: الثقة - modules: "دورة الثقة بالنفس,دورة تحدي الحياة,دورة السيطرة على الغضب"
        ['pack_id' => 7, 'sub_pack_id' => 3, 'order' => 1],  // دورة الثقة بالنفس
        ['pack_id' => 7, 'sub_pack_id' => 10, 'order' => 2], // دورة تحدي الحياة
        ['pack_id' => 7, 'sub_pack_id' => 1, 'order' => 3],  // دورة السيطرة على الغضب
        
        // Pack 8: الذهني - modules: "دورة تحدي الحياة,دورة السيطرة على الغضب,دورة الطفل العنيد"
        ['pack_id' => 8, 'sub_pack_id' => 10, 'order' => 1], // دورة تحدي الحياة
        ['pack_id' => 8, 'sub_pack_id' => 1, 'order' => 2],  // دورة السيطرة على الغضب
        ['pack_id' => 8, 'sub_pack_id' => 2, 'order' => 3],  // دورة الطفل العنيد
    ];
    
    $insertStmt = $db->prepare("
        INSERT INTO mom_pack_sub_pack_links (pack_id, sub_pack_id, order_index)
        VALUES (:pack_id, :sub_pack_id, :order_index)
        ON DUPLICATE KEY UPDATE order_index = :order_index
    ");
    
    $inserted = 0;
    $updated = 0;
    
    foreach ($mappings as $mapping) {
        $insertStmt->execute([
            ':pack_id' => $mapping['pack_id'],
            ':sub_pack_id' => $mapping['sub_pack_id'],
            ':order_index' => $mapping['order']
        ]);
        
        if ($insertStmt->rowCount() > 0) {
            $inserted++;
        } else {
            $updated++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Migration completed successfully',
        'stats' => [
            'total_mappings' => count($mappings),
            'inserted' => $inserted,
            'updated' => $updated
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
?>
