<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['workshop_id'])) {
            getVideosByWorkshopId($_GET['workshop_id'], $db);
        } elseif (isset($_GET['id'])) {
            getVideo($_GET['id'], $db);
        } else {
            getAllVideos($db);
        }
        break;
    case 'POST':
        createVideo($db);
        break;
    case 'PUT':
        updateVideo($db);
        break;
    case 'DELETE':
        deleteVideo($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
        break;
}

function getAllVideos($db) {
    try {
        $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos WHERE workshop_id IS NOT NULL ORDER BY workshop_id, order_index");
        $stmt->execute();
        $videos = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $videos
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getVideosByWorkshopId($workshopId, $db) {
    $userAccess = isset($_GET['user_access']) && $_GET['user_access'] === 'true';
    
    try {
        if ($userAccess) {
            $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos 
                                 WHERE workshop_id = ? 
                                 AND sub_pack_id IS NULL
                                 AND challenge_id IS NULL
                                 AND status = 'active' 
                                 ORDER BY order_index ASC, created_at ASC");
        } else {
            $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos 
                                 WHERE workshop_id = ? 
                                 AND sub_pack_id IS NULL
                                 AND challenge_id IS NULL
                                 ORDER BY order_index ASC, created_at ASC");
        }
        
        $stmt->execute([$workshopId]);
        $videos = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $videos
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getVideo($id, $db) {
    $userAccess = isset($_GET['user_access']) && $_GET['user_access'] === 'true';
    
    try {
        $baseQuery = "SELECT * FROM mom_sub_pack_videos WHERE id = ?";
        
        if ($userAccess) {
            $baseQuery .= " AND status = 'active'";
        }
        
        $stmt = $db->prepare($baseQuery);
        $stmt->execute([$id]);
        $video = $stmt->fetch();
        
        if ($video) {
            echo json_encode([
                'success' => true,
                'data' => $video
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Video not found'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function createVideo($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['workshop_id']) || !isset($input['title']) || !isset($input['video_url'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        $stmt = $db->prepare("INSERT INTO mom_sub_pack_videos (workshop_id, title, description, video_url, thumbnail_url, duration, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['workshop_id'],
            $input['title'],
            $input['description'] ?? null,
            $input['video_url'],
            $input['thumbnail_url'] ?? null,
            $input['duration'] ?? null,
            $input['order_index'] ?? 0,
            $input['status'] ?? 'active'
        ]);
        
        $videoId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Video created successfully',
            'data' => ['id' => $videoId]
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function updateVideo($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing video ID'], JSON_UNESCAPED_UNICODE);
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
        if (isset($input['video_url'])) {
            $fields[] = "video_url = ?";
            $values[] = $input['video_url'];
        }
        if (isset($input['thumbnail_url'])) {
            $fields[] = "thumbnail_url = ?";
            $values[] = $input['thumbnail_url'];
        }
        if (isset($input['duration'])) {
            $fields[] = "duration = ?";
            $values[] = $input['duration'];
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
        
        $sql = "UPDATE mom_sub_pack_videos SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Video updated successfully'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Video not found or no changes made'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function deleteVideo($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing video ID'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM mom_sub_pack_videos WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Video deleted successfully'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Video not found'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
?>
