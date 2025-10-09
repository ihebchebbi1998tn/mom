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
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("SELECT * FROM mom_challenges WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $challenge = $stmt->fetch();
                
                if ($challenge) {
                    echo json_encode(['success' => true, 'challenge' => $challenge]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Challenge not found']);
                }
            } else {
                $stmt = $db->query("SELECT * FROM mom_challenges ORDER BY created_at DESC");
                $challenges = $stmt->fetchAll();
                echo json_encode(['success' => true, 'challenges' => $challenges]);
            }
            break;

        case 'POST':
            $stmt = $db->prepare("
                INSERT INTO mom_challenges (title, description, duration, difficulty, reward, status, start_date, end_date, price, image_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['title'],
                $input['description'],
                $input['duration'],
                $input['difficulty'] ?? 'متوسط',
                $input['reward'],
                $input['status'] ?? 'active',
                $input['start_date'],
                $input['end_date'],
                $input['price'] ?? 0,
                $input['image_url'] ?? null
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Challenge created successfully', 'id' => $db->lastInsertId()]);
            break;

        case 'PUT':
            if (!isset($input['id'])) {
                throw new Exception('Challenge ID is required');
            }

            $fields = [];
            $values = [];
            
            $allowed_fields = ['title', 'description', 'duration', 'difficulty', 'reward', 'status', 'start_date', 'end_date', 'price', 'image_url', 'participants'];
            
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
            
            $stmt = $db->prepare("UPDATE mom_challenges SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
            
            echo json_encode(['success' => true, 'message' => 'Challenge updated successfully']);
            break;

        case 'DELETE':
            if (!isset($input['id'])) {
                throw new Exception('Challenge ID is required');
            }

            $stmt = $db->prepare("DELETE FROM mom_challenges WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Challenge deleted successfully']);
            break;

        default:
            throw new Exception('Method not supported');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
