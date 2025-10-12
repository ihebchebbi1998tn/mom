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
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        // Validate email presence
        if (empty($email)) {
            echo json_encode([
                'success' => false, 
                'message' => 'يرجى إدخال البريد الإلكتروني',
                'field' => 'email'
            ]);
            exit;
        }

        // Validate password presence
        if (empty($password)) {
            echo json_encode([
                'success' => false, 
                'message' => 'يرجى إدخال كلمة المرور',
                'field' => 'password'
            ]);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false, 
                'message' => 'صيغة البريد الإلكتروني غير صحيحة',
                'field' => 'email'
            ]);
            exit;
        }

        try {
            // Check if user exists
            $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM mom_users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'البريد الإلكتروني غير مسجل. يرجى إنشاء حساب جديد',
                    'field' => 'email'
                ]);
                exit;
            }

            // Check if account is active
            if ($user['status'] !== 'active') {
                echo json_encode([
                    'success' => false, 
                    'message' => 'حسابك غير مفعل. يرجى التواصل مع الإدارة',
                    'field' => 'status'
                ]);
                exit;
            }

            // Verify password
            if (!password_verify($password, $user['password'])) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'كلمة المرور غير صحيحة. يرجى التحقق من كلمة المرور والمحاولة مرة أخرى',
                    'field' => 'password'
                ]);
                exit;
            }

            // Successful login
            unset($user['password']);
            echo json_encode([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح',
                'user' => $user
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'حدث خطأ في تسجيل الدخول، يرجى المحاولة مرة أخرى',
                'error' => $e->getMessage()
            ]);
        }
    }

    if ($action === 'signup') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $phone = trim($input['phone'] ?? '');

        // Validate name presence
        if (empty($name)) {
            echo json_encode([
                'success' => false, 
                'message' => 'يرجى إدخال الاسم الكامل',
                'field' => 'name'
            ]);
            exit;
        }

        // Validate name length
        if (strlen($name) < 2) {
            echo json_encode([
                'success' => false, 
                'message' => 'الاسم يجب أن يكون على الأقل حرفين',
                'field' => 'name'
            ]);
            exit;
        }

        if (strlen($name) > 100) {
            echo json_encode([
                'success' => false, 
                'message' => 'الاسم طويل جداً (الحد الأقصى 100 حرف)',
                'field' => 'name'
            ]);
            exit;
        }

        // Validate email presence
        if (empty($email)) {
            echo json_encode([
                'success' => false, 
                'message' => 'يرجى إدخال البريد الإلكتروني',
                'field' => 'email'
            ]);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false, 
                'message' => 'صيغة البريد الإلكتروني غير صحيحة. مثال صحيح: name@example.com',
                'field' => 'email'
            ]);
            exit;
        }

        // Validate email length
        if (strlen($email) > 255) {
            echo json_encode([
                'success' => false, 
                'message' => 'البريد الإلكتروني طويل جداً (الحد الأقصى 255 حرف)',
                'field' => 'email'
            ]);
            exit;
        }

        // Validate password presence
        if (empty($password)) {
            echo json_encode([
                'success' => false, 
                'message' => 'يرجى إدخال كلمة المرور',
                'field' => 'password'
            ]);
            exit;
        }

        // Validate password length
        if (strlen($password) < 6) {
            echo json_encode([
                'success' => false, 
                'message' => 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
                'field' => 'password'
            ]);
            exit;
        }

        if (strlen($password) > 255) {
            echo json_encode([
                'success' => false, 
                'message' => 'كلمة المرور طويلة جداً (الحد الأقصى 255 حرف)',
                'field' => 'password'
            ]);
            exit;
        }

        // Validate phone if provided
        if (!empty($phone)) {
            // Remove all non-numeric characters for validation
            $cleanPhone = preg_replace('/[^0-9+]/', '', $phone);
            
            // Check minimum length (e.g., +216 12345678 = at least 8 digits after country code)
            if (strlen($cleanPhone) < 8) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'رقم الهاتف قصير جداً. يجب أن يحتوي على 8 أرقام على الأقل',
                    'field' => 'phone'
                ]);
                exit;
            }

            // Check maximum length
            if (strlen($cleanPhone) > 20) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'رقم الهاتف طويل جداً',
                    'field' => 'phone'
                ]);
                exit;
            }

            // Validate phone format (must start with + or digit)
            if (!preg_match('/^[\+]?[0-9]+$/', $cleanPhone)) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'صيغة رقم الهاتف غير صحيحة. مثال صحيح: +216 12345678',
                    'field' => 'phone'
                ]);
                exit;
            }
        }

        try {
            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM mom_users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'هذا البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد آخر أو تسجيل الدخول',
                    'field' => 'email'
                ]);
                exit;
            }

            // Create new user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $phoneValue = !empty($phone) ? $phone : null;
            
            $stmt = $db->prepare("INSERT INTO mom_users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'client')");
            $stmt->execute([$name, $email, $hashedPassword, $phoneValue]);

            $userId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء الحساب بنجاح! مرحباً بك في أكاديمية الأم',
                'user' => [
                    'id' => (string)$userId,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phoneValue,
                    'role' => 'client',
                    'status' => 'active'
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى',
                'error' => $e->getMessage()
            ]);
        }
    }
}
?>