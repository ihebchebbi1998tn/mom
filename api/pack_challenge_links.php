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

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['challenge_id'])) {
                // Get all sub-packs assigned to a challenge
                $challenge_id = intval($_GET['challenge_id']);
                
                $stmt = $conn->prepare("
                    SELECT pcl.*, sp.title as sub_pack_title, sp.pack_id, cp.title as pack_title
                    FROM pack_challenge_links pcl
                    LEFT JOIN sub_packs sp ON pcl.sub_pack_id = sp.id
                    LEFT JOIN course_packs cp ON sp.pack_id = cp.id
                    WHERE pcl.challenge_id = ?
                    ORDER BY sp.order_index
                ");
                $stmt->bind_param("i", $challenge_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                $links = [];
                while ($row = $result->fetch_assoc()) {
                    $links[] = $row;
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $links
                ]);
            } else {
                // Get all links
                $result = $conn->query("
                    SELECT pcl.*, sp.title as sub_pack_title, c.title as challenge_title
                    FROM pack_challenge_links pcl
                    LEFT JOIN sub_packs sp ON pcl.sub_pack_id = sp.id
                    LEFT JOIN challenges c ON pcl.challenge_id = c.id
                    ORDER BY pcl.created_at DESC
                ");
                
                $links = [];
                while ($row = $result->fetch_assoc()) {
                    $links[] = $row;
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $links
                ]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['challenge_id']) || !isset($data['sub_pack_id'])) {
                throw new Exception('Missing required fields');
            }
            
            $challenge_id = intval($data['challenge_id']);
            $sub_pack_id = intval($data['sub_pack_id']);
            
            // Check if link already exists
            $stmt = $conn->prepare("SELECT id FROM pack_challenge_links WHERE challenge_id = ? AND sub_pack_id = ?");
            $stmt->bind_param("ii", $challenge_id, $sub_pack_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Link already exists'
                ]);
                break;
            }
            
            // Create new link
            $stmt = $conn->prepare("INSERT INTO pack_challenge_links (challenge_id, sub_pack_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $challenge_id, $sub_pack_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Link created successfully',
                    'id' => $conn->insert_id
                ]);
            } else {
                throw new Exception('Failed to create link');
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['challenge_id']) || !isset($_GET['sub_pack_id'])) {
                throw new Exception('Missing required parameters');
            }
            
            $challenge_id = intval($_GET['challenge_id']);
            $sub_pack_id = intval($_GET['sub_pack_id']);
            
            $stmt = $conn->prepare("DELETE FROM pack_challenge_links WHERE challenge_id = ? AND sub_pack_id = ?");
            $stmt->bind_param("ii", $challenge_id, $sub_pack_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Link deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete link');
            }
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
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
