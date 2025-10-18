<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['video_id']) || !isset($input['filename'])) {
    echo json_encode(['success' => false, 'message' => 'Missing video_id or filename']);
    exit;
}

$videoId = $input['video_id'];
$filename = $input['filename'];

try {
    // Preferred cache directory
    $primaryDir = __DIR__ . '/video';
    $legacyDir  = __DIR__ . '/videos';

    if (!is_dir($primaryDir)) {
        @mkdir($primaryDir, 0755, true);
    }

    $targetPath = $primaryDir . '/' . basename($filename);

    // If not in primary, check legacy and migrate
    if (!file_exists($targetPath) && is_dir($legacyDir)) {
        $legacyPath = $legacyDir . '/' . basename($filename);
        if (file_exists($legacyPath)) {
            // Try to move (rename), fallback to copy
            if (!@rename($legacyPath, $targetPath)) {
                @copy($legacyPath, $targetPath);
            }
        }
    }
    
    if (file_exists($targetPath)) {
        // Update the video URL to point to the cached file
        $newVideoUrl = 'https://spadadibattaglia.com/mom/api/video/' . basename($filename);
        
        $stmt = $db->prepare("UPDATE mom_sub_pack_videos SET video_url = ? WHERE id = ?");
        $stmt->execute([$newVideoUrl, $videoId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Video URL updated to cached version',
                'new_url' => $newVideoUrl
            ]);
        } else {
            // Possibly already set to this URL. Verify current value.
            $check = $db->prepare("SELECT video_url FROM mom_sub_pack_videos WHERE id = ?");
            $check->execute([$videoId]);
            $row = $check->fetch();
            if ($row && $row['video_url'] === $newVideoUrl) {
                echo json_encode([
                    'success' => true,
                    'message' => 'URL already points to cached file',
                    'new_url' => $newVideoUrl
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Video not found or no changes made']);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Cached video file not found']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>