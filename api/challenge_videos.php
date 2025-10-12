-- Refactored challenge_videos.php to use unified mom_sub_pack_videos table
-- This API now retrieves challenge videos from the mom_sub_pack_videos table
-- where challenge_id is not null
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
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['challenge_id'])) {
                $query = "
                    SELECT v.*, c.title as challenge_title 
                    FROM mom_sub_pack_videos v
                    JOIN mom_challenges c ON v.challenge_id = c.id
                    WHERE v.challenge_id = ? 
                    AND v.sub_pack_id IS NULL 
                    AND v.workshop_id IS NULL
                ";
                
                if (isset($_GET['user_access']) && $_GET['user_access'] === 'true') {
                    $query .= " AND v.status = 'active'";
                }
                
                $query .= " ORDER BY v.order_index ASC";
                
                $stmt = $db->prepare($query);
                $stmt->execute([$_GET['challenge_id']]);
            } elseif (isset($_GET['id'])) {
                $stmt = $db->prepare("
                    SELECT v.*, c.title as challenge_title 
                    FROM mom_sub_pack_videos v
                    JOIN mom_challenges c ON v.challenge_id = c.id
                    WHERE v.id = ? 
                    AND v.challenge_id IS NOT NULL
                ");
                $stmt->execute([$_GET['id']]);
            } else {
                $stmt = $db->query("
                    SELECT v.*, c.title as challenge_title 
                    FROM mom_sub_pack_videos v
                    JOIN mom_challenges c ON v.challenge_id = c.id
                    WHERE v.challenge_id IS NOT NULL
                    ORDER BY v.created_at DESC
                ");
            }
            
            $videos = $stmt->fetchAll();
            echo json_encode(['success' => true, 'videos' => $videos]);
            break;

        case 'POST':
            $stmt = $db->prepare("
                INSERT INTO mom_sub_pack_videos (challenge_id, title, description, video_url, thumbnail_url, duration, order_index, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['challenge_id'],
                $input['title'],
                $input['description'] ?? null,
                $input['video_url'],
                $input['thumbnail_url'] ?? null,
                $input['duration'] ?? null,
                $input['order_index'] ?? 0,
                $input['status'] ?? 'active'
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Video created successfully', 'id' => $db->lastInsertId()]);
            break;

        case 'PUT':
            if (!isset($input['id'])) {
                throw new Exception('Video ID is required');
            }

            $fields = [];
            $values = [];
            
            $allowed_fields = ['title', 'description', 'video_url', 'thumbnail_url', 'duration', 'order_index', 'status'];
            
            foreach ($allowed_fields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                throw new Exception('No fields to update');
            }
            
            $values[] = $input['id'];
            
            $stmt = $db->prepare("UPDATE mom_sub_pack_videos SET " . implode(', ', $fields) . " WHERE id = ? AND challenge_id IS NOT NULL");
            $stmt->execute($values);
            
            echo json_encode(['success' => true, 'message' => 'Video updated successfully']);
            break;

        case 'DELETE':
            if (!isset($input['id'])) {
                throw new Exception('Video ID is required');
            }

            $stmt = $db->prepare("DELETE FROM mom_sub_pack_videos WHERE id = ? AND challenge_id IS NOT NULL");
            $stmt->execute([$input['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Video deleted successfully']);
            break;

        default:
            throw new Exception('Method not supported');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
