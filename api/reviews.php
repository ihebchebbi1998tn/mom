<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all approved reviews
            $stmt = $db->prepare("
                SELECT r.*, 
                       DATE_FORMAT(r.created_at, '%Y-%m-%d') as formatted_date
                FROM mom_reviews r 
                WHERE r.status = 'approved' 
                ORDER BY r.created_at DESC
            ");
            $stmt->execute();
            $reviews = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $reviews
            ]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($input['user_id']) || !isset($input['user_name']) || 
                !isset($input['user_email']) || !isset($input['rating']) || 
                !isset($input['review_text'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit;
            }
            
            // Validate rating
            if ($input['rating'] < 1 || $input['rating'] > 5) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Rating must be between 1 and 5'
                ]);
                exit;
            }
            
            // Check if user already has a review
            $checkStmt = $db->prepare("SELECT id FROM mom_reviews WHERE user_id = ?");
            $checkStmt->execute([$input['user_id']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'User already has a review'
                ]);
                exit;
            }
            
            // Insert new review with pending status
            $stmt = $db->prepare("
                INSERT INTO mom_reviews (user_id, user_name, user_email, rating, review_text, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')
            ");
            
            $stmt->execute([
                $input['user_id'],
                $input['user_name'],
                $input['user_email'],
                $input['rating'],
                $input['review_text']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Review submitted successfully',
                'review_id' => $db->lastInsertId()
            ]);
            break;
            
        case 'PUT':
            // Update review status (admin only)
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['status'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit;
            }
            
            $stmt = $db->prepare("UPDATE mom_reviews SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Review status updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete review (admin only)
            $review_id = $_GET['id'] ?? null;
            
            if (!$review_id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Review ID is required'
                ]);
                exit;
            }
            
            $stmt = $db->prepare("DELETE FROM mom_reviews WHERE id = ?");
            $stmt->execute([$review_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>