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

try {
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['pack_id'])) {
                getSubPacksByPackId($_GET['pack_id'], $db);
            } elseif (isset($_GET['sub_pack_id'])) {
                getPacksBySubPackId($_GET['sub_pack_id'], $db);
            } else {
                getAllLinks($db);
            }
            break;
        case 'POST':
            createLink($db);
            break;
        case 'PUT':
            updateLink($db);
            break;
        case 'DELETE':
            deleteLink($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function getAllLinks($db) {
    $stmt = $db->query("
        SELECT 
            l.*,
            p.title as pack_title,
            sp.title as sub_pack_title
        FROM mom_pack_sub_pack_links l
        JOIN mom_packs p ON l.pack_id = p.id
        JOIN mom_sub_packs sp ON l.sub_pack_id = sp.id
        ORDER BY l.pack_id, l.order_index
    ");
    
    $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $links]);
}

function getSubPacksByPackId($packId, $db) {
    $stmt = $db->prepare("
        SELECT 
            sp.*,
            l.order_index
        FROM mom_sub_packs sp
        JOIN mom_pack_sub_pack_links l ON sp.id = l.sub_pack_id
        WHERE l.pack_id = :pack_id
        ORDER BY l.order_index
    ");
    
    $stmt->execute([':pack_id' => $packId]);
    $subPacks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $subPacks]);
}

function getPacksBySubPackId($subPackId, $db) {
    $stmt = $db->prepare("
        SELECT 
            p.*,
            l.order_index
        FROM mom_packs p
        JOIN mom_pack_sub_pack_links l ON p.id = l.pack_id
        WHERE l.sub_pack_id = :sub_pack_id
        ORDER BY p.title
    ");
    
    $stmt->execute([':sub_pack_id' => $subPackId]);
    $packs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $packs]);
}

function createLink($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['pack_id']) || !isset($input['sub_pack_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'pack_id and sub_pack_id are required']);
        return;
    }
    
    $stmt = $db->prepare("
        INSERT INTO mom_pack_sub_pack_links (pack_id, sub_pack_id, order_index)
        VALUES (:pack_id, :sub_pack_id, :order_index)
    ");
    
    $stmt->execute([
        ':pack_id' => $input['pack_id'],
        ':sub_pack_id' => $input['sub_pack_id'],
        ':order_index' => $input['order_index'] ?? 0
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Link created successfully',
        'id' => $db->lastInsertId()
    ]);
}

function updateLink($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'id is required']);
        return;
    }
    
    $updates = [];
    $params = [':id' => $input['id']];
    
    if (isset($input['order_index'])) {
        $updates[] = "order_index = :order_index";
        $params[':order_index'] = $input['order_index'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $sql = "UPDATE mom_pack_sub_pack_links SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(['success' => true, 'message' => 'Link updated successfully']);
}

function deleteLink($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['pack_id']) || !isset($input['sub_pack_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'pack_id and sub_pack_id are required']);
        return;
    }
    
    $stmt = $db->prepare("
        DELETE FROM mom_pack_sub_pack_links 
        WHERE pack_id = :pack_id AND sub_pack_id = :sub_pack_id
    ");
    
    $stmt->execute([
        ':pack_id' => $input['pack_id'],
        ':sub_pack_id' => $input['sub_pack_id']
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Link deleted successfully']);
}
?>
