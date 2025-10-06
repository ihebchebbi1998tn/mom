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
        // Get all workshops linked to a specific pack
        if (isset($_GET['pack_id'])) {
            $pack_id = intval($_GET['pack_id']);
            $sql = "SELECT w.*, pwl.order_index 
                    FROM mom_workshops w
                    INNER JOIN mom_pack_workshop_links pwl ON w.id = pwl.workshop_id
                    WHERE pwl.pack_id = ?
                    ORDER BY pwl.order_index ASC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $pack_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $workshops = [];
            while ($row = $result->fetch_assoc()) {
                if (!empty($row['highlights'])) {
                    $row['highlights'] = json_decode($row['highlights'], true);
                }
                $workshops[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $workshops]);
        } else {
            // Get all pack-workshop links
            $sql = "SELECT * FROM mom_pack_workshop_links ORDER BY pack_id, order_index";
            $result = $conn->query($sql);
            $links = [];
            while ($row = $result->fetch_assoc()) {
                $links[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $links]);
        }
        break;

    case 'POST':
        // Link a workshop to a pack
        if (!isset($input['pack_id']) || !isset($input['workshop_id'])) {
            echo json_encode(['success' => false, 'message' => 'Pack ID and Workshop ID are required']);
            exit;
        }

        $pack_id = intval($input['pack_id']);
        $workshop_id = intval($input['workshop_id']);
        $order_index = isset($input['order_index']) ? intval($input['order_index']) : 0;

        $sql = "INSERT INTO mom_pack_workshop_links (pack_id, workshop_id, order_index) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE order_index = VALUES(order_index)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $pack_id, $workshop_id, $order_index);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Workshop linked successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to link workshop: ' . $stmt->error]);
        }
        break;

    case 'DELETE':
        // Unlink a workshop from a pack
        if (isset($_GET['pack_id']) && isset($_GET['workshop_id'])) {
            $pack_id = intval($_GET['pack_id']);
            $workshop_id = intval($_GET['workshop_id']);

            $sql = "DELETE FROM mom_pack_workshop_links WHERE pack_id = ? AND workshop_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $pack_id, $workshop_id);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Workshop unlinked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to unlink workshop']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Pack ID and Workshop ID are required']);
        }
        break;

    case 'PUT':
        // Update order of workshops in a pack
        if (!isset($input['links']) || !is_array($input['links'])) {
            echo json_encode(['success' => false, 'message' => 'Links array is required']);
            exit;
        }

        $conn->begin_transaction();
        try {
            foreach ($input['links'] as $link) {
                $sql = "UPDATE mom_pack_workshop_links 
                        SET order_index = ? 
                        WHERE pack_id = ? AND workshop_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("iii", $link['order_index'], $link['pack_id'], $link['workshop_id']);
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
