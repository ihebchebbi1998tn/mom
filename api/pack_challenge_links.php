<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['pack_id'])) {
                // Get all challenges assigned to a pack
                $stmt = $db->prepare("
                    SELECT pcl.*, c.title as challenge_title, c.description, c.status, c.price
                    FROM mom_pack_challenge_links pcl
                    LEFT JOIN mom_challenges c ON pcl.challenge_id = c.id
                    WHERE pcl.pack_id = ?
                    ORDER BY pcl.order_index
                ");
                $stmt->execute([$_GET['pack_id']]);
                $links = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $links
                ]);
            } elseif (isset($_GET['challenge_id'])) {
                // Get all packs assigned to a challenge
                $stmt = $db->prepare("
                    SELECT pcl.*, p.title as pack_title, p.price, p.status
                    FROM mom_pack_challenge_links pcl
                    LEFT JOIN mom_packs p ON pcl.pack_id = p.id
                    WHERE pcl.challenge_id = ?
                    ORDER BY pcl.order_index
                ");
                $stmt->execute([$_GET['challenge_id']]);
                $links = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $links
                ]);
            } else {
                // Get all links
                $stmt = $db->query("
                    SELECT pcl.*, p.title as pack_title, c.title as challenge_title
                    FROM mom_pack_challenge_links pcl
                    LEFT JOIN mom_packs p ON pcl.pack_id = p.id
                    LEFT JOIN mom_challenges c ON pcl.challenge_id = c.id
                    ORDER BY pcl.created_at DESC
                ");
                $links = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $links
                ]);
            }
            break;
            
        case 'POST':
            if (!isset($input['pack_id']) || !isset($input['challenge_id'])) {
                throw new Exception('Missing required fields');
            }
            
            $order_index = isset($input['order_index']) ? intval($input['order_index']) : 0;
            
            // Check if link already exists
            $stmt = $db->prepare("SELECT id FROM mom_pack_challenge_links WHERE pack_id = ? AND challenge_id = ?");
            $stmt->execute([$input['pack_id'], $input['challenge_id']]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Link already exists'
                ]);
                break;
            }
            
            // Create new link
            $stmt = $db->prepare("INSERT INTO mom_pack_challenge_links (pack_id, challenge_id, order_index) VALUES (?, ?, ?)");
            $stmt->execute([$input['pack_id'], $input['challenge_id'], $order_index]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Link created successfully',
                'id' => $db->lastInsertId()
            ]);
            break;
            
        case 'PUT':
            if (!isset($input['pack_id']) || !isset($input['challenge_id']) || !isset($input['order_index'])) {
                throw new Exception('Missing required fields');
            }
            
            $stmt = $db->prepare("UPDATE mom_pack_challenge_links SET order_index = ? WHERE pack_id = ? AND challenge_id = ?");
            $stmt->execute([$input['order_index'], $input['pack_id'], $input['challenge_id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Order updated successfully'
            ]);
            break;
            
        case 'DELETE':
            if (!isset($_GET['pack_id']) || !isset($_GET['challenge_id'])) {
                throw new Exception('Missing required parameters');
            }
            
            $stmt = $db->prepare("DELETE FROM mom_pack_challenge_links WHERE pack_id = ? AND challenge_id = ?");
            $stmt->execute([$_GET['pack_id'], $_GET['challenge_id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Link deleted successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
