<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$filename = $_GET['file'] ?? null;
if (!$filename) {
    echo json_encode(['success' => false, 'message' => 'Missing file parameter']);
    exit;
}

try {
    $primaryDir = __DIR__ . '/video';
    $legacyDir  = __DIR__ . '/videos';

    $exists = file_exists($primaryDir . '/' . basename($filename))
           || file_exists($legacyDir . '/' . basename($filename));

    echo json_encode([
        'success' => true,
        'exists' => $exists
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>