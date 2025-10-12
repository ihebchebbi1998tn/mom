<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
        $sub_pack_id = $_GET['sub_pack_id'] ?? null;
        $status = $_GET['status'] ?? null;
        
        try {
            if ($id) {
                // Get specific request with details
                $sql = "SELECT spr.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                               sp.title as sub_pack_title, cp.title as pack_title, spr.recu_link
                        FROM mom_sub_pack_requests spr
                        LEFT JOIN mom_users u ON spr.user_id = u.id
                        LEFT JOIN mom_sub_packs sp ON spr.sub_pack_id = sp.id
                        LEFT JOIN mom_packs cp ON sp.pack_id = cp.id
                        WHERE spr.id = ?";
                
                $stmt = $db->prepare($sql);
                $stmt->execute([$id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result) {
                    echo json_encode(['success' => true, 'data' => $result], JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Request not found'], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Get all requests with filters
                $sql = "SELECT spr.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                               sp.title as sub_pack_title, cp.title as pack_title, cp.id as pack_id, spr.recu_link
                        FROM mom_sub_pack_requests spr
                        LEFT JOIN mom_users u ON spr.user_id = u.id
                        LEFT JOIN mom_sub_packs sp ON spr.sub_pack_id = sp.id
                        LEFT JOIN mom_packs cp ON sp.pack_id = cp.id";
                
                $conditions = [];
                $params = [];
                
                if ($user_id) {
                    $conditions[] = "spr.user_id = ?";
                    $params[] = $user_id;
                }
                
                if ($sub_pack_id) {
                    $conditions[] = "spr.sub_pack_id = ?";
                    $params[] = $sub_pack_id;
                }
                
                if ($status) {
                    $conditions[] = "spr.status = ?";
                    $params[] = $status;
                }
                
                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }
                
                $sql .= " ORDER BY spr.created_at DESC";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $requests], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch requests: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'POST':
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);
        if (!is_array($input) || empty($input)) {
            // Fallback to form-encoded or multipart form data
            $input = $_POST ?? [];
        }
        
        // Handle _method override for FormData PUT requests
        if (isset($input['_method']) && strtoupper($input['_method']) === 'PUT') {
            // Redirect to PUT handling
            $_SERVER['REQUEST_METHOD'] = 'PUT';
            $id = $input['id'] ?? null;
            $status = $input['status'] ?? null;
            $admin_notes = $input['admin_notes'] ?? '';
            $recu_link = $input['recu_link'] ?? null;

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'Request ID is required'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            try {
                // Build dynamic query based on provided fields
                $updateFields = [];
                $params = [];
                
                if ($status !== null) {
                    if (!in_array($status, ['pending', 'accepted', 'rejected'])) {
                        echo json_encode(['success' => false, 'message' => 'Invalid status'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                    $updateFields[] = "status = ?";
                    $params[] = $status;
                    $updateFields[] = "admin_response_date = CURRENT_TIMESTAMP";
                }
                
                if ($admin_notes !== null) {
                    $updateFields[] = "admin_notes = ?";
                    $params[] = $admin_notes;
                }
                
                if ($recu_link !== null) {
                    $updateFields[] = "recu_link = ?";
                    $params[] = $recu_link;
                }
                
                if (empty($updateFields)) {
                    echo json_encode(['success' => false, 'message' => 'No fields to update'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $params[] = $id; // Add ID for WHERE clause
                $sql = "UPDATE mom_sub_pack_requests SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($params);

                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Request updated successfully'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Request not found or no changes made'], JSON_UNESCAPED_UNICODE);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Failed to update request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }
        
        // Regular POST - create new sub-pack request
        $user_id = $input['user_id'] ?? null;
        $sub_pack_id = $input['sub_pack_id'] ?? null;

        if (!$user_id || !$sub_pack_id) {
            echo json_encode(['success' => false, 'message' => 'User ID and Sub-Pack ID are required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            // Check if request already exists
            $stmt = $db->prepare("SELECT id, status FROM mom_sub_pack_requests WHERE user_id = ? AND sub_pack_id = ?");
            $stmt->execute([$user_id, $sub_pack_id]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                if ($existing['status'] === 'pending') {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'You already have a pending request for this course'
                    ], JSON_UNESCAPED_UNICODE);
                } elseif ($existing['status'] === 'accepted') {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'You already have access to this course'
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Request already exists',
                        'existing_status' => $existing['status']
                    ], JSON_UNESCAPED_UNICODE);
                }
                exit;
            }

            // Create new request
            $stmt = $db->prepare("INSERT INTO mom_sub_pack_requests (user_id, sub_pack_id, status) VALUES (?, ?, 'pending')");
            $stmt->execute([$user_id, $sub_pack_id]);

            $requestId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Purchase request created successfully',
                'data' => [
                    'id' => $requestId,
                    'user_id' => $user_id,
                    'sub_pack_id' => $sub_pack_id,
                    'status' => 'pending'
                ]
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'PUT':
        // Handle both JSON and form data input
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input) || empty($input)) {
            // Fallback to $_POST for FormData requests
            $input = $_POST ?? [];
        }
        
        $id = $input['id'] ?? null;
        $status = $input['status'] ?? null;
        $admin_notes = $input['admin_notes'] ?? '';
        $recu_link = $input['recu_link'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Request ID is required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            // Build dynamic query based on provided fields
            $updateFields = [];
            $params = [];
            
            if ($status !== null) {
                if (!in_array($status, ['pending', 'accepted', 'rejected'])) {
                    echo json_encode(['success' => false, 'message' => 'Invalid status'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $updateFields[] = "status = ?";
                $params[] = $status;
                $updateFields[] = "admin_response_date = CURRENT_TIMESTAMP";
            }
            
            if ($admin_notes !== null) {
                $updateFields[] = "admin_notes = ?";
                $params[] = $admin_notes;
            }
            
            if ($recu_link !== null) {
                $updateFields[] = "recu_link = ?";
                $params[] = $recu_link;
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'message' => 'No fields to update'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $params[] = $id; // Add ID for WHERE clause
            $sql = "UPDATE mom_sub_pack_requests SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Request updated successfully'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Request not found or no changes made'], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Request ID required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM mom_sub_pack_requests WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Request deleted successfully'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Request not found'], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
        break;
}
?>
