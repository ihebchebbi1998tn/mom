<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'message' => 'No image file provided'], JSON_UNESCAPED_UNICODE);
    exit;
}

$image_file = $_FILES['image'];

// Validate file
$allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($image_file['type'], $allowed_types)) {
    echo json_encode(['success' => false, 'message' => 'Invalid image file type'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Check file size (max 20MB after compression)
if ($image_file['size'] > 20 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'File size too large. Maximum 20MB allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Create uploads directory if it doesn't exist
$upload_dir = 'uploads/images/';
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Generate unique filename
$file_extension = strtolower(pathinfo($image_file['name'], PATHINFO_EXTENSION));
$unique_filename = 'image_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
$upload_path = $upload_dir . $unique_filename;

// Move uploaded file
if (!move_uploaded_file($image_file['tmp_name'], $upload_path)) {
    echo json_encode(['success' => false, 'message' => 'Failed to upload image file'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Get image URL
$image_url = 'https://spadadibattaglia.com/mom/api/' . $upload_path;

echo json_encode([
    'success' => true,
    'message' => 'Image uploaded successfully',
    'image_url' => $image_url,
    'filename' => $unique_filename,
    'size' => $image_file['size']
], JSON_UNESCAPED_UNICODE);
?>