<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Check if this is a FormData PUT request disguised as POST
if ($method === 'POST' && !empty($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['user_id'])) {
                $stmt = $db->prepare("
                    SELECT cr.*, c.title as challenge_title, c.price, u.name as username, u.email
                    FROM mom_challenge_requests cr
                    JOIN mom_challenges c ON cr.challenge_id = c.id
                    JOIN mom_users u ON cr.user_id = u.id
                    WHERE cr.user_id = ?
                    ORDER BY cr.created_at DESC
                ");
                $stmt->execute([$_GET['user_id']]);
            } elseif (isset($_GET['challenge_id'])) {
                $stmt = $db->prepare("
                    SELECT cr.*, c.title as challenge_title, u.name as username, u.email
                    FROM mom_challenge_requests cr
                    JOIN mom_challenges c ON cr.challenge_id = c.id
                    JOIN mom_users u ON cr.user_id = u.id
                    WHERE cr.challenge_id = ?
                    ORDER BY cr.created_at DESC
                ");
                $stmt->execute([$_GET['challenge_id']]);
            } elseif (isset($_GET['status'])) {
                $stmt = $db->prepare("
                    SELECT cr.*, c.title as challenge_title, u.name as username, u.email
                    FROM mom_challenge_requests cr
                    JOIN mom_challenges c ON cr.challenge_id = c.id
                    JOIN mom_users u ON cr.user_id = u.id
                    WHERE cr.status = ?
                    ORDER BY cr.created_at DESC
                ");
                $stmt->execute([$_GET['status']]);
            } else {
                $stmt = $db->query("
                    SELECT cr.*, c.title as challenge_title, u.name as username, u.email
                    FROM mom_challenge_requests cr
                    JOIN mom_challenges c ON cr.challenge_id = c.id
                    JOIN mom_users u ON cr.user_id = u.id
                    ORDER BY cr.created_at DESC
                ");
            }
            
            $requests = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $requests]);
            break;

        case 'POST':
            // Check if it's FormData
            if (!empty($_POST)) {
                $user_id = $_POST['user_id'] ?? null;
                $challenge_id = $_POST['challenge_id'] ?? null;
            } else {
                $input = json_decode(file_get_contents('php://input'), true);
                $user_id = $input['user_id'] ?? null;
                $challenge_id = $input['challenge_id'] ?? null;
            }

            if (!$user_id || !$challenge_id) {
                throw new Exception('user_id and challenge_id are required');
            }

            // Check if request already exists
            $stmt = $db->prepare("SELECT id FROM mom_challenge_requests WHERE user_id = ? AND challenge_id = ?");
            $stmt->execute([$user_id, $challenge_id]);
            
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'لقد قمت بالفعل بتقديم طلب لهذا التحدي']);
                exit;
            }

            // Create new request
            $stmt = $db->prepare("
                INSERT INTO mom_challenge_requests (user_id, challenge_id, status) 
                VALUES (?, ?, 'pending')
            ");
            $stmt->execute([$user_id, $challenge_id]);
            
            $request_id = $db->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'تم إرسال طلبك بنجاح',
                'data' => ['id' => $request_id]
            ]);
            break;

        case 'PUT':
            // Check if it's FormData
            if (!empty($_POST) && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
                $id = $_POST['id'] ?? null;
                $status = $_POST['status'] ?? null;
                $admin_notes = $_POST['admin_notes'] ?? null;
                $recu_link = $_POST['recu_link'] ?? null;
            } else {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $input['id'] ?? null;
                $status = $input['status'] ?? null;
                $admin_notes = $input['admin_notes'] ?? null;
                $recu_link = $input['recu_link'] ?? null;
            }

            if (!$id) {
                throw new Exception('Request ID is required');
            }

            $fields = [];
            $values = [];
            
            if ($status !== null) {
                if (!in_array($status, ['pending', 'accepted', 'rejected'])) {
                    throw new Exception('Invalid status value');
                }
                $fields[] = "status = ?";
                $values[] = $status;
                $fields[] = "admin_response_date = NOW()";
            }
            
            if ($admin_notes !== null) {
                $fields[] = "admin_notes = ?";
                $values[] = $admin_notes;
            }
            
            if ($recu_link !== null) {
                $fields[] = "recu_link = ?";
                $values[] = $recu_link;
            }
            
            if (empty($fields)) {
                throw new Exception('No fields to update');
            }
            
            $values[] = $id;
            
            $stmt = $db->prepare("UPDATE mom_challenge_requests SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
            
            echo json_encode(['success' => true, 'message' => 'Request updated successfully']);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('Request ID is required');
            }

            $stmt = $db->prepare("DELETE FROM mom_challenge_requests WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Request deleted successfully']);
            break;

        default:
            throw new Exception('Method not supported');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
