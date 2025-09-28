<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input) || empty($input)) {
    $input = $_POST ?? [];
}

if ($method === 'POST') {
    if (!isset($input['action'])) {
        echo json_encode(['success' => false, 'message' => 'Action required']);
        exit;
    }

    $action = $input['action'];

    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'يرجى إدخال البريد الإلكتروني وكلمة المرور']);
            exit;
        }

        try {
            $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM mom_users WHERE email = ? AND status = 'active'");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                unset($user['password']);
                echo json_encode([
                    'success' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    'user' => $user
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'حدث خطأ في تسجيل الدخول، يرجى المحاولة مرة أخرى']);
        }
    }

    if ($action === 'signup') {
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $phone = $input['phone'] ?? null;

        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'يرجى إدخال الاسم والبريد الإلكتروني وكلمة المرور']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'صيغة البريد الإلكتروني غير صحيحة']);
            exit;
        }

        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'كلمة المرور يجب أن تكون على الأقل 6 أحرف']);
            exit;
        }

        try {
            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM mom_users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى استخدام بريد آخر أو تسجيل الدخول']);
                exit;
            }

            // Create new user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO mom_users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'client')");
            $stmt->execute([$name, $email, $hashedPassword, $phone]);

            $userId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء الحساب بنجاح! مرحباً بك في أكاديمية الأم',
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'role' => 'client',
                    'status' => 'active'
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى']);
        }
    }
}
?>