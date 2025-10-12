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
            // Get all reviews for admin (all statuses)
            $stmt = $db->prepare("
                SELECT r.*, 
                       DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i') as formatted_date
                FROM mom_reviews r 
                ORDER BY r.created_at DESC
            ");
            $stmt->execute();
            $reviews = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $reviews
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
            
            // Validate status
            $allowedStatuses = ['pending', 'approved', 'rejected'];
            if (!in_array($input['status'], $allowedStatuses)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid status. Must be: pending, approved, or rejected'
                ]);
                exit;
            }
            
            $stmt = $db->prepare("UPDATE mom_reviews SET status = ?, updated_at = NOW() WHERE id = ?");
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