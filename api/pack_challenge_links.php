<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch($method) {
        case 'GET':
            // Get all challenges linked to a specific pack
            if (isset($_GET['pack_id'])) {
                $pack_id = intval($_GET['pack_id']);
                $stmt = $db->prepare("
                    SELECT c.*, pcl.order_index 
                    FROM mom_challenges c
                    INNER JOIN mom_pack_challenge_links pcl ON c.id = pcl.challenge_id
                    WHERE pcl.pack_id = :pack_id
                    ORDER BY pcl.order_index ASC
                ");
                $stmt->execute([':pack_id' => $pack_id]);
                $challenges = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $challenges]);
            } else {
                // Get all pack-challenge links
                $stmt = $db->query("SELECT * FROM mom_pack_challenge_links ORDER BY pack_id, order_index");
                $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $links]);
            }
            break;

        case 'POST':
            // Link a challenge to a pack
            if (!isset($input['pack_id']) || !isset($input['challenge_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Pack ID and Challenge ID are required']);
                exit;
            }

            $pack_id = intval($input['pack_id']);
            $challenge_id = intval($input['challenge_id']);
            $order_index = isset($input['order_index']) ? intval($input['order_index']) : 0;

            $stmt = $db->prepare("
                INSERT INTO mom_pack_challenge_links (pack_id, challenge_id, order_index) 
                VALUES (:pack_id, :challenge_id, :order_index)
                ON DUPLICATE KEY UPDATE order_index = :order_index
            ");
            
            if ($stmt->execute([
                ':pack_id' => $pack_id,
                ':challenge_id' => $challenge_id,
                ':order_index' => $order_index
            ])) {
                echo json_encode(['success' => true, 'message' => 'Challenge linked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to link challenge']);
            }
            break;

        case 'DELETE':
            // Unlink a challenge from a pack
            if (!isset($input['pack_id']) || !isset($input['challenge_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Pack ID and Challenge ID are required']);
                exit;
            }

            $pack_id = intval($input['pack_id']);
            $challenge_id = intval($input['challenge_id']);

            $stmt = $db->prepare("DELETE FROM mom_pack_challenge_links WHERE pack_id = :pack_id AND challenge_id = :challenge_id");
            
            if ($stmt->execute([':pack_id' => $pack_id, ':challenge_id' => $challenge_id])) {
                echo json_encode(['success' => true, 'message' => 'Challenge unlinked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to unlink challenge']);
            }
            break;

        case 'PUT':
            // Update order of challenges in a pack
            if (!isset($input['links']) || !is_array($input['links'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Links array is required']);
                exit;
            }

            $db->beginTransaction();
            try {
                foreach ($input['links'] as $link) {
                    $stmt = $db->prepare("
                        UPDATE mom_pack_challenge_links 
                        SET order_index = :order_index 
                        WHERE pack_id = :pack_id AND challenge_id = :challenge_id
                    ");
                    $stmt->execute([
                        ':order_index' => $link['order_index'],
                        ':pack_id' => $link['pack_id'],
                        ':challenge_id' => $link['challenge_id']
                    ]);
                }
                $db->commit();
                echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
            } catch (Exception $e) {
                $db->rollback();
                echo json_encode(['success' => false, 'message' => 'Failed to update order: ' . $e->getMessage()]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not supported']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
