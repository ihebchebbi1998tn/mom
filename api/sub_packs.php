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

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['pack_id'])) {
                getSubPacksByPackId($_GET['pack_id'], $db);
            } elseif (isset($_GET['id'])) {
                getSubPack($_GET['id'], $db);
            } else {
                getAllSubPacks($db);
            }
            break;
        case 'POST':
            createSubPack($db);
            break;
        case 'PUT':
            updateSubPack($db);
            break;
        case 'DELETE':
            deleteSubPack($db);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

function getAllSubPacks($db) {
    try {
        $stmt = $db->prepare("SELECT sp.*, p.title as pack_title FROM mom_sub_packs sp LEFT JOIN mom_packs p ON sp.pack_id = p.id ORDER BY sp.pack_id, sp.order_index");
        $stmt->execute();
        $subPacks = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $subPacks
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getSubPacksByPackId($packId, $db) {
    try {
        $stmt = $db->prepare("SELECT * FROM mom_sub_packs WHERE pack_id = ? ORDER BY order_index ASC");
        $stmt->execute([$packId]);
        $subPacks = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $subPacks
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getSubPack($id, $db) {
    try {
        $stmt = $db->prepare("SELECT sp.*, p.title as pack_title FROM mom_sub_packs sp LEFT JOIN mom_packs p ON sp.pack_id = p.id WHERE sp.id = ?");
        $stmt->execute([$id]);
        $subPack = $stmt->fetch();
        
        if ($subPack) {
            // Get videos
            $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos WHERE sub_pack_id = ? ORDER BY order_index ASC");
            $stmt->execute([$id]);
            $subPack['videos'] = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $subPack
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Sub pack not found'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function createSubPack($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['pack_id']) || !isset($input['title'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        $stmt = $db->prepare("INSERT INTO mom_sub_packs (pack_id, title, description, banner_image_url, intro_video_url, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['pack_id'],
            $input['title'],
            $input['description'] ?? null,
            $input['banner_image_url'] ?? null,
            $input['intro_video_url'] ?? null,
            $input['order_index'] ?? 0,
            $input['status'] ?? 'active'
        ]);
        
        $subPackId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Sub pack created successfully',
            'data' => ['id' => $subPackId]
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function updateSubPack($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing sub pack ID'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        $fields = [];
        $values = [];
        
        if (isset($input['title'])) {
            $fields[] = "title = ?";
            $values[] = $input['title'];
        }
        if (isset($input['description'])) {
            $fields[] = "description = ?";
            $values[] = $input['description'];
        }
        if (isset($input['banner_image_url'])) {
            $fields[] = "banner_image_url = ?";
            $values[] = $input['banner_image_url'];
        }
        if (isset($input['intro_video_url'])) {
            $fields[] = "intro_video_url = ?";
            $values[] = $input['intro_video_url'];
        }
        if (isset($input['order_index'])) {
            $fields[] = "order_index = ?";
            $values[] = $input['order_index'];
        }
        if (isset($input['status'])) {
            $fields[] = "status = ?";
            $values[] = $input['status'];
        }
        
        if (empty($fields)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $values[] = $input['id'];
        
        $sql = "UPDATE mom_sub_packs SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Sub pack updated successfully'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Sub pack not found or no changes made'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function deleteSubPack($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing sub pack ID'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM mom_sub_packs WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Sub pack deleted successfully'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Sub pack not found'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
?>