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
            // Get all workshops linked to a specific pack
            if (isset($_GET['pack_id'])) {
                $pack_id = intval($_GET['pack_id']);
                $stmt = $db->prepare("
                    SELECT w.*, pwl.order_index 
                    FROM mom_workshops w
                    INNER JOIN mom_pack_workshop_links pwl ON w.id = pwl.workshop_id
                    WHERE pwl.pack_id = :pack_id
                    ORDER BY pwl.order_index ASC
                ");
                $stmt->execute([':pack_id' => $pack_id]);
                $workshops = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($workshops as &$workshop) {
                    if (!empty($workshop['highlights'])) {
                        $workshop['highlights'] = json_decode($workshop['highlights'], true);
                    }
                }
                
                echo json_encode(['success' => true, 'data' => $workshops]);
            } else {
                // Get all pack-workshop links
                $stmt = $db->query("SELECT * FROM mom_pack_workshop_links ORDER BY pack_id, order_index");
                $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $links]);
            }
            break;

        case 'POST':
            // Link a workshop to a pack
            if (!isset($input['pack_id']) || !isset($input['workshop_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Pack ID and Workshop ID are required']);
                exit;
            }

            $pack_id = intval($input['pack_id']);
            $workshop_id = intval($input['workshop_id']);
            $order_index = isset($input['order_index']) ? intval($input['order_index']) : 0;

            $stmt = $db->prepare("
                INSERT INTO mom_pack_workshop_links (pack_id, workshop_id, order_index) 
                VALUES (:pack_id, :workshop_id, :order_index)
                ON DUPLICATE KEY UPDATE order_index = :order_index
            ");
            
            if ($stmt->execute([
                ':pack_id' => $pack_id,
                ':workshop_id' => $workshop_id,
                ':order_index' => $order_index
            ])) {
                echo json_encode(['success' => true, 'message' => 'Workshop linked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to link workshop']);
            }
            break;

        case 'DELETE':
            // Unlink a workshop from a pack
            if (!isset($input['pack_id']) || !isset($input['workshop_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Pack ID and Workshop ID are required']);
                exit;
            }

            $pack_id = intval($input['pack_id']);
            $workshop_id = intval($input['workshop_id']);

            $stmt = $db->prepare("DELETE FROM mom_pack_workshop_links WHERE pack_id = :pack_id AND workshop_id = :workshop_id");
            
            if ($stmt->execute([':pack_id' => $pack_id, ':workshop_id' => $workshop_id])) {
                echo json_encode(['success' => true, 'message' => 'Workshop unlinked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to unlink workshop']);
            }
            break;

        case 'PUT':
            // Update order of workshops in a pack
            if (!isset($input['links']) || !is_array($input['links'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Links array is required']);
                exit;
            }

            $db->beginTransaction();
            try {
                foreach ($input['links'] as $link) {
                    $stmt = $db->prepare("
                        UPDATE mom_pack_workshop_links 
                        SET order_index = :order_index 
                        WHERE pack_id = :pack_id AND workshop_id = :workshop_id
                    ");
                    $stmt->execute([
                        ':order_index' => $link['order_index'],
                        ':pack_id' => $link['pack_id'],
                        ':workshop_id' => $link['workshop_id']
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
