<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$database = new Database();
$conn = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single promotion
                $stmt = $conn->prepare("SELECT * FROM mom_promotions WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($promotion) {
                    $promotion['pack_ids'] = json_decode($promotion['pack_ids'], true);
                    echo json_encode([
                        'success' => true,
                        'promotion' => $promotion
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Promotion not found'
                    ]);
                }
            } else {
                // Get all promotions
                $stmt = $conn->query("SELECT * FROM mom_promotions ORDER BY created_at DESC");
                $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($promotions as &$promotion) {
                    $promotion['pack_ids'] = json_decode($promotion['pack_ids'], true);
                }
                
                echo json_encode([
                    'success' => true,
                    'promotions' => $promotions
                ]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['pack_ids']) || !isset($data['discount_percentage']) || !isset($data['end_date'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                break;
            }

            $stmt = $conn->prepare("
                INSERT INTO mom_promotions 
                (pack_ids, discount_percentage, description, end_date, is_active) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $pack_ids_json = json_encode($data['pack_ids']);
            $is_active = isset($data['is_active']) ? $data['is_active'] : 1;
            $description = isset($data['description']) ? $data['description'] : null;
            
            $stmt->execute([
                $pack_ids_json,
                $data['discount_percentage'],
                $description,
                $data['end_date'],
                $is_active
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Promotion created successfully',
                'id' => $conn->lastInsertId()
            ]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Promotion ID is required'
                ]);
                break;
            }

            $updates = [];
            $params = [];

            if (isset($data['pack_ids'])) {
                $updates[] = "pack_ids = ?";
                $params[] = json_encode($data['pack_ids']);
            }
            if (isset($data['discount_percentage'])) {
                $updates[] = "discount_percentage = ?";
                $params[] = $data['discount_percentage'];
            }
            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['end_date'])) {
                $updates[] = "end_date = ?";
                $params[] = $data['end_date'];
            }
            if (isset($data['is_active'])) {
                $updates[] = "is_active = ?";
                $params[] = $data['is_active'];
            }

            if (empty($updates)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No fields to update'
                ]);
                break;
            }

            $params[] = $data['id'];
            $sql = "UPDATE mom_promotions SET " . implode(', ', $updates) . " WHERE id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);

            echo json_encode([
                'success' => true,
                'message' => 'Promotion updated successfully'
            ]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Promotion ID is required'
                ]);
                break;
            }

            $stmt = $conn->prepare("DELETE FROM mom_promotions WHERE id = ?");
            $stmt->execute([$data['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Promotion deleted successfully'
            ]);
            break;

        default:
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
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
