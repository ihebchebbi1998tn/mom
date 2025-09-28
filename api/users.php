<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // Get all users or single user
        $id = $_GET['id'] ?? null;
        
        try {
            if ($id) {
                $stmt = $db->prepare("SELECT id, name, email, phone, role, status, created_at, updated_at FROM mom_users WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch();
                
                if ($user) {
                    echo json_encode(['success' => true, 'user' => $user]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'User not found']);
                }
            } else {
                $stmt = $db->prepare("SELECT id, name, email, phone, role, status, created_at, updated_at FROM mom_users ORDER BY created_at DESC");
                $stmt->execute();
                $users = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'users' => $users]);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch users']);
        }
        break;

    case 'POST':
        // Create new user
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $phone = $input['phone'] ?? null;
        $role = $input['role'] ?? 'client';
        $status = $input['status'] ?? 'active';

        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Name, email and password required']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        try {
            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM mom_users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                exit;
            }

            // Create new user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO mom_users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $hashedPassword, $phone, $role, $status]);

            $userId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'role' => $role,
                    'status' => $status
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create user']);
        }
        break;

    case 'PUT':
        // Update user
        $id = $input['id'] ?? null;
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $phone = $input['phone'] ?? null;
        $role = $input['role'] ?? 'client';
        $status = $input['status'] ?? 'active';
        $password = $input['password'] ?? null;

        if (!$id || empty($name) || empty($email)) {
            echo json_encode(['success' => false, 'message' => 'ID, name and email required']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        try {
            // Check if email exists for other users
            $stmt = $db->prepare("SELECT id FROM mom_users WHERE email = ? AND id != ?");
            $stmt->execute([$email, $id]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                exit;
            }

            // Update user with or without password
            if (!empty($password)) {
                // Update with new password
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $db->prepare("UPDATE mom_users SET name = ?, email = ?, password = ?, phone = ?, role = ?, status = ? WHERE id = ?");
                $stmt->execute([$name, $email, $hashedPassword, $phone, $role, $status, $id]);
            } else {
                // Update without changing password
                $stmt = $db->prepare("UPDATE mom_users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?");
                $stmt->execute([$name, $email, $phone, $role, $status, $id]);
            }

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'User not found or no changes made']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete user
        $id = $input['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM mom_users WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>