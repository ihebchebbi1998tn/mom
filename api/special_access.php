<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin authentication
$headers = getallheaders();
$adminId = isset($headers['X-Admin-Id']) ? intval($headers['X-Admin-Id']) : null;

if (!$adminId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Verify user is admin
$stmt = $db->prepare("SELECT role FROM mom_users WHERE id = :id");
$stmt->execute([':id' => $adminId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden - Admin access required']);
    exit;
}

try {
    // GET - List users with special access for a sub-pack
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $subPackId = isset($_GET['sub_pack_id']) ? intval($_GET['sub_pack_id']) : null;
        
        if ($subPackId) {
            // Get users with special access for this sub-pack
            $stmt = $db->prepare("
                SELECT 
                    sa.*,
                    u.name as user_name,
                    u.email as user_email,
                    admin.name as granted_by_name
                FROM mom_special_access sa
                JOIN mom_users u ON sa.user_id = u.id
                JOIN mom_users admin ON sa.granted_by = admin.id
                WHERE sa.sub_pack_id = :sub_pack_id
                ORDER BY sa.granted_at DESC
            ");
            $stmt->execute([':sub_pack_id' => $subPackId]);
            $access = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $access]);
        } else {
            // Get all users for selection
            $stmt = $db->prepare("
                SELECT id, name, email, phone 
                FROM mom_users 
                WHERE role = 'user'
                ORDER BY name ASC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'users' => $users]);
        }
    }
    
    // POST - Grant special access
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $userIds = $data['user_ids'] ?? [];
        $subPackId = $data['sub_pack_id'] ?? null;
        $notes = $data['notes'] ?? '';
        
        if (empty($userIds) || !$subPackId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        // Verify sub-pack is in restricted list (6, 7, 8)
        if (!in_array($subPackId, [6, 7, 8])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Special access only for sub-packs 6, 7, 8']);
            exit;
        }
        
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            INSERT INTO mom_special_access (user_id, sub_pack_id, granted_by, notes)
            VALUES (:user_id, :sub_pack_id, :granted_by, :notes)
            ON DUPLICATE KEY UPDATE 
                granted_by = :granted_by,
                granted_at = CURRENT_TIMESTAMP,
                notes = :notes
        ");
        
        $granted = 0;
        foreach ($userIds as $userId) {
            $stmt->execute([
                ':user_id' => $userId,
                ':sub_pack_id' => $subPackId,
                ':granted_by' => $adminId,
                ':notes' => $notes
            ]);
            $granted++;
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => "Access granted to $granted user(s)",
            'granted_count' => $granted
        ]);
    }
    
    // DELETE - Revoke special access
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
        $subPackId = isset($_GET['sub_pack_id']) ? intval($_GET['sub_pack_id']) : null;
        
        if (!$userId || !$subPackId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing user_id or sub_pack_id']);
            exit;
        }
        
        $stmt = $db->prepare("
            DELETE FROM mom_special_access 
            WHERE user_id = :user_id AND sub_pack_id = :sub_pack_id
        ");
        $stmt->execute([':user_id' => $userId, ':sub_pack_id' => $subPackId]);
        
        echo json_encode(['success' => true, 'message' => 'Access revoked']);
    }
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
