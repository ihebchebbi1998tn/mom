<?php
// Enable gzip compression for faster uploads
if (extension_loaded('zlib') && !ob_get_length()) {
    ob_start('ob_gzhandler');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Optimize PHP settings for large uploads
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300); // 5 minutes
ini_set('post_max_size', '400M');
ini_set('upload_max_filesize', '400M');

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
            if (isset($_GET['sub_pack_id'])) {
                getVideosBySubPackId($_GET['sub_pack_id'], $db);
            } elseif (isset($_GET['workshop_id'])) {
                getVideosByWorkshopId($_GET['workshop_id'], $db);
            } elseif (isset($_GET['id'])) {
                getVideo($_GET['id'], $db);
            } else {
                getAllVideos($db);
            }
            break;
        case 'POST':
            if (isset($_FILES['video'])) {
                uploadVideo($db);
            } else {
                createVideo($db);
            }
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
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

function getAllVideos($db) {
    try {
        $stmt = $db->prepare("SELECT v.*, 
                              sp.title as sub_pack_title, 
                              p.title as pack_title,
                              w.title as workshop_title
                              FROM mom_sub_pack_videos v 
                              LEFT JOIN mom_sub_packs sp ON v.sub_pack_id = sp.id 
                              LEFT JOIN mom_packs p ON sp.pack_id = p.id 
                              LEFT JOIN mom_workshops w ON v.workshop_id = w.id
                              ORDER BY COALESCE(v.sub_pack_id, 0), COALESCE(v.workshop_id, 0), v.order_index");
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

function getVideosBySubPackId($subPackId, $db) {
    $userAccess = isset($_GET['user_access']) && $_GET['user_access'] === 'true';
    
    try {
        // Check if available_at column exists
        $columnExists = false;
        try {
            $checkStmt = $db->prepare("DESCRIBE mom_sub_pack_videos available_at");
            $checkStmt->execute();
            $columnExists = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            $columnExists = false;
        }
        
        if ($userAccess) {
            // For user access, filter by availability if column exists
            if ($columnExists) {
                $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos 
                                     WHERE sub_pack_id = ? AND workshop_id IS NULL
                                     AND status = 'active' 
                                     AND (available_at IS NULL OR available_at <= NOW()) 
                                     ORDER BY order_index ASC, created_at ASC");
            } else {
                $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos 
                                     WHERE sub_pack_id = ? AND workshop_id IS NULL
                                     AND status = 'active' 
                                     ORDER BY order_index ASC, created_at ASC");
            }
        } else {
            // For admin access, show all videos
            $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos WHERE sub_pack_id = ? AND workshop_id IS NULL ORDER BY order_index ASC, created_at ASC");
        }
        
        $stmt->execute([$subPackId]);
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
                                 WHERE workshop_id = ? AND sub_pack_id IS NULL
                                 AND status = 'active' 
                                 ORDER BY order_index ASC, created_at ASC");
        } else {
            // For admin access, show all videos
            $stmt = $db->prepare("SELECT * FROM mom_sub_pack_videos WHERE workshop_id = ? AND sub_pack_id IS NULL ORDER BY order_index ASC, created_at ASC");
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
        // Check if available_at column exists
        $columnExists = false;
        try {
            $checkStmt = $db->prepare("DESCRIBE mom_sub_pack_videos available_at");
            $checkStmt->execute();
            $columnExists = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            $columnExists = false;
        }
        
        $baseQuery = "SELECT v.*, 
                     sp.title as sub_pack_title, 
                     p.title as pack_title,
                     w.title as workshop_title
                     FROM mom_sub_pack_videos v 
                     LEFT JOIN mom_sub_packs sp ON v.sub_pack_id = sp.id 
                     LEFT JOIN mom_packs p ON sp.pack_id = p.id 
                     LEFT JOIN mom_workshops w ON v.workshop_id = w.id
                     WHERE v.id = ?";
        
        if ($userAccess) {
            if ($columnExists) {
                $baseQuery .= " AND v.status = 'active' AND (v.available_at IS NULL OR v.available_at <= NOW())";
            } else {
                $baseQuery .= " AND v.status = 'active'";
            }
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

function uploadVideo($db) {
    if (!isset($_FILES['video']) || !isset($_POST['title'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    // Validate that either sub_pack_id or workshop_id is provided, but not both
    $hasSubPack = isset($_POST['sub_pack_id']) && !empty($_POST['sub_pack_id']);
    $hasWorkshop = isset($_POST['workshop_id']) && !empty($_POST['workshop_id']);
    
    if (!$hasSubPack && !$hasWorkshop) {
        echo json_encode(['success' => false, 'message' => 'Either sub_pack_id or workshop_id must be provided'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    if ($hasSubPack && $hasWorkshop) {
        echo json_encode(['success' => false, 'message' => 'Cannot provide both sub_pack_id and workshop_id'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        // Create uploads directory structure if it doesn't exist
        $baseUploadDir = dirname(__FILE__) . '/uploads/';
        $videoUploadDir = $baseUploadDir . 'videos/';
        
        // Create base uploads directory
        if (!file_exists($baseUploadDir)) {
            if (!mkdir($baseUploadDir, 0755, true)) {
                echo json_encode(['success' => false, 'message' => 'Failed to create base upload directory'], JSON_UNESCAPED_UNICODE);
                return;
            }
        }
        
        // Create videos subdirectory
        if (!file_exists($videoUploadDir)) {
            if (!mkdir($videoUploadDir, 0755, true)) {
                echo json_encode(['success' => false, 'message' => 'Failed to create video upload directory'], JSON_UNESCAPED_UNICODE);
                return;
            }
        }
        
        // Validate file
        $file = $_FILES['video'];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'File is too large (exceeds php.ini limit)',
                UPLOAD_ERR_FORM_SIZE => 'File is too large (exceeds form limit)',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
            ];
            $message = $errorMessages[$file['error']] ?? 'Unknown upload error';
            echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Get file extension from original filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
        
        if (!in_array($extension, $allowedExtensions)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Only MP4, AVI, MOV, WMV, MKV, WEBM allowed'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Check MIME type as additional security
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'video/mp4',
            'video/x-msvideo', // AVI
            'video/quicktime', // MOV
            'video/x-ms-wmv', // WMV
            'video/x-matroska', // MKV
            'video/webm'
        ];
        
        if (!in_array($mimeType, $allowedMimes)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file format detected'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Maximum file size: 400MB (increased to handle pre-compression files)
        if ($file['size'] > 400 * 1024 * 1024) {
            echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 400MB'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Generate unique filename with timestamp and random string
        $timestamp = time();
        $randomString = bin2hex(random_bytes(8));
        $filename = "video_{$timestamp}_{$randomString}.{$extension}";
        $filePath = $videoUploadDir . $filename;
        
        // Move uploaded file with optimized handling
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Set proper file permissions
            chmod($filePath, 0644);
            
            // Optional: Additional compression on server side if needed
            $finalSize = filesize($filePath);
            $compressionRatio = round(($finalSize / $file['size']) * 100, 1);
            
            $videoUrl = 'https://spadadibattaglia.com/mom/api/uploads/videos/' . $filename;
            
            // Save to database
            $stmt = $db->prepare("INSERT INTO mom_sub_pack_videos (sub_pack_id, workshop_id, title, description, video_url, thumbnail_url, duration, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['sub_pack_id'] ?? null,
                $_POST['workshop_id'] ?? null,
                $_POST['title'],
                $_POST['description'] ?? null,
                $videoUrl,
                $_POST['thumbnail_url'] ?? null,
                $_POST['duration'] ?? null,
                $_POST['order_index'] ?? 0,
                $_POST['status'] ?? 'active'
            ]);
            
            $videoId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Video uploaded successfully',
                'data' => [
                    'id' => $videoId,
                    'video_url' => $videoUrl,
                    'filename' => $filename,
                    'original_size' => $file['size'],
                    'final_size' => $finalSize,
                    'compression_ratio' => $compressionRatio . '%'
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file. Check directory permissions.'], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Upload error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function createVideo($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['title']) || !isset($input['video_url'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    // Validate that either sub_pack_id or workshop_id is provided, but not both
    $hasSubPack = isset($input['sub_pack_id']) && !empty($input['sub_pack_id']);
    $hasWorkshop = isset($input['workshop_id']) && !empty($input['workshop_id']);
    
    if (!$hasSubPack && !$hasWorkshop) {
        echo json_encode(['success' => false, 'message' => 'Either sub_pack_id or workshop_id must be provided'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    if ($hasSubPack && $hasWorkshop) {
        echo json_encode(['success' => false, 'message' => 'Cannot provide both sub_pack_id and workshop_id'], JSON_UNESCAPED_UNICODE);
        return;
    }
    
    try {
        // Check if available_at column exists
        $columnExists = false;
        try {
            $checkStmt = $db->prepare("DESCRIBE mom_sub_pack_videos available_at");
            $checkStmt->execute();
            $columnExists = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            $columnExists = false;
        }
        
        if ($columnExists) {
            $stmt = $db->prepare("INSERT INTO mom_sub_pack_videos (sub_pack_id, workshop_id, title, description, video_url, thumbnail_url, duration, available_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['sub_pack_id'] ?? null,
                $input['workshop_id'] ?? null,
                $input['title'],
                $input['description'] ?? null,
                $input['video_url'],
                $input['thumbnail_url'] ?? null,
                $input['duration'] ?? null,
                $input['available_at'] ?? null,
                $input['status'] ?? 'active'
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO mom_sub_pack_videos (sub_pack_id, workshop_id, title, description, video_url, thumbnail_url, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['sub_pack_id'] ?? null,
                $input['workshop_id'] ?? null,
                $input['title'],
                $input['description'] ?? null,
                $input['video_url'],
                $input['thumbnail_url'] ?? null,
                $input['duration'] ?? null,
                $input['status'] ?? 'active'
            ]);
        }
        
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
        if (isset($input['available_at'])) {
            $fields[] = "available_at = ?";
            $values[] = $input['available_at'];
        }
        if (isset($input['status'])) {
            $fields[] = "status = ?";
            $values[] = $input['status'];
        }
        if (isset($input['sub_pack_id'])) {
            $fields[] = "sub_pack_id = ?";
            $values[] = $input['sub_pack_id'];
        }
        if (isset($input['workshop_id'])) {
            $fields[] = "workshop_id = ?";
            $values[] = $input['workshop_id'];
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
        // Get video info first to delete file
        $stmt = $db->prepare("SELECT video_url FROM mom_sub_pack_videos WHERE id = ?");
        $stmt->execute([$input['id']]);
        $video = $stmt->fetch();
        
        if ($video) {
            // Delete from database
            $stmt = $db->prepare("DELETE FROM mom_sub_pack_videos WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            // Try to delete file (optional)
            $videoPath = str_replace('https://spadadibattaglia.com/mom/api/', dirname(__FILE__) . '/', $video['video_url']);
            if (file_exists($videoPath)) {
                unlink($videoPath);
            }
            
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