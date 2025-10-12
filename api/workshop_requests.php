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
        $user_id = $_GET['user_id'] ?? null;
        $workshop_id = $_GET['workshop_id'] ?? null;
        $status = $_GET['status'] ?? null;
        
        try {
            $sql = "SELECT wr.*, u.name as user_name, u.email as user_email, u.phone as user_phone, 
                           w.title as workshop_title, w.price as workshop_price, wr.recu_link
                    FROM mom_workshop_requests wr 
                    JOIN mom_users u ON wr.user_id = u.id 
                    JOIN mom_workshops w ON wr.workshop_id = w.id";
            
            $conditions = [];
            $params = [];
            
            if ($user_id) {
                $conditions[] = "wr.user_id = ?";
                $params[] = $user_id;
            }
            
            if ($workshop_id) {
                $conditions[] = "wr.workshop_id = ?";
                $params[] = $workshop_id;
            }
            
            if ($status) {
                $conditions[] = "wr.status = ?";
                $params[] = $status;
            }
            
            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(" AND ", $conditions);
            }
            
            $sql .= " ORDER BY wr.created_at DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $requests = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $requests], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch requests: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'POST':
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }
        
        // Handle _method override for FormData PUT requests
        if (isset($input['_method']) && strtoupper($input['_method']) === 'PUT') {
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
                
                $params[] = $id;
                $sql = "UPDATE mom_workshop_requests SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($params);

                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Request updated successfully'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Request not found'], JSON_UNESCAPED_UNICODE);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Failed to update request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }
        
        $user_id = $input['user_id'] ?? null;
        $workshop_id = $input['workshop_id'] ?? null;

        if (!$user_id || !$workshop_id) {
            echo json_encode(['success' => false, 'message' => 'User ID and Workshop ID are required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            // Check if request already exists
            $stmt = $db->prepare("SELECT id, status FROM mom_workshop_requests WHERE user_id = ? AND workshop_id = ?");
            $stmt->execute([$user_id, $workshop_id]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Request already exists',
                    'existing_status' => $existing['status']
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Create new request
            $stmt = $db->prepare("INSERT INTO mom_workshop_requests (user_id, workshop_id, status) VALUES (?, ?, 'pending')");
            $stmt->execute([$user_id, $workshop_id]);

            $requestId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Workshop request created successfully',
                'data' => [
                    'id' => $requestId,
                    'user_id' => $user_id,
                    'workshop_id' => $workshop_id,
                    'status' => 'pending'
                ]
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create request: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input) || empty($input)) {
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
            
            $params[] = $id;
            $sql = "UPDATE mom_workshop_requests SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Request updated successfully'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Request not found'], JSON_UNESCAPED_UNICODE);
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
            $stmt = $db->prepare("DELETE FROM mom_workshop_requests WHERE id = ?");
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
