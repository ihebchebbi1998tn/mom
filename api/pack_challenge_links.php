<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        // Get all challenges linked to a specific pack
        if (isset($_GET['pack_id'])) {
            $pack_id = intval($_GET['pack_id']);
            $sql = "SELECT c.*, pcl.order_index 
                    FROM mom_challenges c
                    INNER JOIN mom_pack_challenge_links pcl ON c.id = pcl.challenge_id
                    WHERE pcl.pack_id = ?
                    ORDER BY pcl.order_index ASC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $pack_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $challenges = [];
            while ($row = $result->fetch_assoc()) {
                $challenges[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $challenges]);
        } else {
            // Get all pack-challenge links
            $sql = "SELECT * FROM mom_pack_challenge_links ORDER BY pack_id, order_index";
            $result = $conn->query($sql);
            $links = [];
            while ($row = $result->fetch_assoc()) {
                $links[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $links]);
        }
        break;

    case 'POST':
        // Link a challenge to a pack
        if (!isset($input['pack_id']) || !isset($input['challenge_id'])) {
            echo json_encode(['success' => false, 'message' => 'Pack ID and Challenge ID are required']);
            exit;
        }

        $pack_id = intval($input['pack_id']);
        $challenge_id = intval($input['challenge_id']);
        $order_index = isset($input['order_index']) ? intval($input['order_index']) : 0;

        $sql = "INSERT INTO mom_pack_challenge_links (pack_id, challenge_id, order_index) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE order_index = VALUES(order_index)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $pack_id, $challenge_id, $order_index);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Challenge linked successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to link challenge: ' . $stmt->error]);
        }
        break;

    case 'DELETE':
        // Unlink a challenge from a pack
        if (isset($_GET['pack_id']) && isset($_GET['challenge_id'])) {
            $pack_id = intval($_GET['pack_id']);
            $challenge_id = intval($_GET['challenge_id']);

            $sql = "DELETE FROM mom_pack_challenge_links WHERE pack_id = ? AND challenge_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $pack_id, $challenge_id);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Challenge unlinked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to unlink challenge']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Pack ID and Challenge ID are required']);
        }
        break;

    case 'PUT':
        // Update order of challenges in a pack
        if (!isset($input['links']) || !is_array($input['links'])) {
            echo json_encode(['success' => false, 'message' => 'Links array is required']);
            exit;
        }

        $conn->begin_transaction();
        try {
            foreach ($input['links'] as $link) {
                $sql = "UPDATE mom_pack_challenge_links 
                        SET order_index = ? 
                        WHERE pack_id = ? AND challenge_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("iii", $link['order_index'], $link['pack_id'], $link['challenge_id']);
                $stmt->execute();
            }
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to update order: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not supported']);
        break;
}

$conn->close();
?>
