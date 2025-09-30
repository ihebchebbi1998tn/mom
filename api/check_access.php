<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$user_id = $_GET['user_id'] ?? null;
$pack_id = $_GET['pack_id'] ?? null;

if (!$user_id || !$pack_id) {
    echo json_encode(['success' => false, 'message' => 'User ID and Pack ID are required'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Check if user has accepted request for this pack
    $stmt = $db->prepare("SELECT r.id, r.status, r.request_date, r.admin_response_date, r.recu_link
                         FROM mom_requests r 
                         WHERE r.user_id = ? AND r.pack_id = ?");
    $stmt->execute([$user_id, $pack_id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        echo json_encode([
            'success' => true,
            'has_access' => false,
            'status' => 'no_request',
            'message' => 'No purchase request found'
        ], JSON_UNESCAPED_UNICODE);
    } else if ($request['status'] === 'accepted') {
        echo json_encode([
            'success' => true,
            'has_access' => true,
            'status' => 'accepted',
            'request_id' => $request['id'],
            'request_date' => $request['request_date'],
            'response_date' => $request['admin_response_date'],
            'recu_link' => $request['recu_link']
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => true,
            'has_access' => false,
            'status' => $request['status'],
            'request_id' => $request['id'],
            'request_date' => $request['request_date'],
            'recu_link' => $request['recu_link'],
            'message' => $request['status'] === 'pending' ? 'Request is pending approval' : 'Request was rejected'
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to check access: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>