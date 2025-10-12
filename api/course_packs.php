<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        
        try {
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM mom_packs WHERE id = ?");
                $stmt->execute([$id]);
                $pack = $stmt->fetch();
                
                if ($pack) {
                    // Get sub packs through junction table
                    $stmt = $db->prepare("
                        SELECT sp.*, l.order_index
                        FROM mom_sub_packs sp
                        JOIN mom_pack_sub_pack_links l ON sp.id = l.sub_pack_id
                        WHERE l.pack_id = ?
                        ORDER BY l.order_index ASC
                    ");
                    $stmt->execute([$id]);
                    $pack['sub_packs'] = $stmt->fetchAll();
                    
                    echo json_encode(['success' => true, 'data' => $pack], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Course pack not found'], JSON_UNESCAPED_UNICODE);
                }
            } else {
                $stmt = $db->prepare("SELECT * FROM mom_packs ORDER BY created_at DESC");
                $stmt->execute();
                $packs = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $packs], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch course packs: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        $title = $input['title'] ?? '';
        $modules = $input['modules'] ?? '';
        $price = $input['price'] ?? '';
        $duration = $input['duration'] ?? '4 أسابيع';
        $students = $input['students'] ?? '0+';
        $rating = $input['rating'] ?? 5.0;
        $image_url = $input['image_url'] ?? null;
        $intro_video_url = $input['intro_video_url'] ?? null;
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'active';

        if (empty($title) || empty($modules) || empty($price)) {
            echo json_encode(['success' => false, 'message' => 'Title, modules and price are required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            // Convert modules array to string if needed
            if (is_array($modules)) {
                $modules = implode(',', $modules);
            }
            
            $stmt = $db->prepare("INSERT INTO mom_packs (title, modules, price, duration, students, rating, image_url, intro_video_url, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $modules, $price, $duration, $students, $rating, $image_url, $intro_video_url, $description, $status]);

            $packId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Course pack created successfully',
                'data' => [
                    'id' => $packId,
                    'title' => $title,
                    'modules' => $modules,
                    'price' => $price,
                    'duration' => $duration,
                    'students' => $students,
                    'rating' => $rating,
                    'image_url' => $image_url,
                    'intro_video_url' => $intro_video_url,
                    'description' => $description,
                    'status' => $status
                ]
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create course pack: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? null;
        $title = $input['title'] ?? '';
        $modules = $input['modules'] ?? '';
        $price = $input['price'] ?? '';
        $duration = $input['duration'] ?? '4 أسابيع';
        $students = $input['students'] ?? '0+';
        $rating = $input['rating'] ?? 5.0;
        $image_url = $input['image_url'] ?? null;
        $intro_video_url = $input['intro_video_url'] ?? null;
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'active';

        if (!$id || empty($title) || empty($modules) || empty($price)) {
            echo json_encode(['success' => false, 'message' => 'ID, title, modules and price are required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            // Convert modules array to string if needed
            if (is_array($modules)) {
                $modules = implode(',', $modules);
            }
            
            $stmt = $db->prepare("UPDATE mom_packs SET title = ?, modules = ?, price = ?, duration = ?, students = ?, rating = ?, image_url = ?, intro_video_url = ?, description = ?, status = ? WHERE id = ?");
            $stmt->execute([$title, $modules, $price, $duration, $students, $rating, $image_url, $intro_video_url, $description, $status, $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Course pack updated successfully'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Course pack not found or no changes made'], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update course pack: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Course pack ID required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM mom_packs WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Course pack deleted successfully'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Course pack not found'], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete course pack: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
        break;
}
?>