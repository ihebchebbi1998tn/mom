<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $challenge_id = isset($_GET['challenge_id']) ? intval($_GET['challenge_id']) : null;

    if (!$user_id || !$challenge_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing user_id or challenge_id']);
        exit;
    }

    // Check if user is admin - admins have automatic access to everything
    $userStmt = $db->prepare("SELECT role FROM mom_users WHERE id = :user_id");
    $userStmt->execute([':user_id' => $user_id]);
    $userRole = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userRole && $userRole['role'] === 'admin') {
        echo json_encode([
            'success' => true,
            'hasAccess' => true,
            'accessType' => 'admin_bypass',
            'message' => 'Admin access granted'
        ]);
        exit;
    }

    // Check 1: Special admin-granted access (for challenges linked to restricted sub-packs 6, 7, 8)
    // Challenges are accessed through sub-packs, so check if this challenge is linked to restricted sub-packs
    $stmt = $db->prepare("
        SELECT sp.id FROM mom_sub_packs sp
        WHERE sp.id IN (6, 7, 8)
        LIMIT 1
    ");
    $stmt->execute();
    
    // For challenges in restricted sub-packs, check special access
    if (in_array($challenge_id, [6, 7, 8])) {
        // Map challenge ID to corresponding sub-pack ID (assuming 1:1 mapping)
        $corresponding_subpack_id = $challenge_id;
        
        $stmt = $db->prepare("
            SELECT * FROM mom_special_access 
            WHERE user_id = :user_id AND sub_pack_id = :sub_pack_id
        ");
        $stmt->execute([':user_id' => $user_id, ':sub_pack_id' => $corresponding_subpack_id]);
        $specialAccess = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($specialAccess) {
            echo json_encode([
                'success' => true,
                'hasAccess' => true,
                'accessType' => 'special',
                'message' => 'Special admin-granted access'
            ]);
            exit;
        } else {
            echo json_encode([
                'success' => true,
                'hasAccess' => false,
                'message' => 'This content requires special admin authorization'
            ]);
            exit;
        }
    }

    // Check 2: Direct challenge access (for non-restricted challenges)
    $stmt = $db->prepare("
        SELECT * FROM mom_challenge_requests 
        WHERE user_id = :user_id AND challenge_id = :challenge_id AND status = 'accepted'
    ");
    $stmt->execute([':user_id' => $user_id, ':challenge_id' => $challenge_id]);
    $directAccess = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($directAccess) {
        echo json_encode([
            'success' => true,
            'hasAccess' => true,
            'accessType' => 'direct',
            'message' => 'Direct challenge access'
        ]);
        exit;
    }

    // Check 3: Access via pack purchase
    $stmt = $db->prepare("
        SELECT p.*, r.status, r.request_date
        FROM mom_packs p
        INNER JOIN mom_pack_challenge_links pcl ON p.id = pcl.pack_id
        INNER JOIN mom_requests r ON p.id = r.pack_id
        WHERE pcl.challenge_id = :challenge_id 
        AND r.user_id = :user_id 
        AND r.status = 'accepted'
        LIMIT 1
    ");
    $stmt->execute([':challenge_id' => $challenge_id, ':user_id' => $user_id]);
    $packAccess = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($packAccess) {
        echo json_encode([
            'success' => true,
            'hasAccess' => true,
            'accessType' => 'pack',
            'packName' => $packAccess['title'],
            'packId' => $packAccess['id'],
            'message' => 'Access via pack: ' . $packAccess['title']
        ]);
        exit;
    }

    // No access
    echo json_encode([
        'success' => true,
        'hasAccess' => false,
        'message' => 'No access to this challenge'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
