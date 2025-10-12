<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

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

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['date'])) {
                // Get reservations for specific date
                $stmt = $db->prepare("SELECT * FROM mom_reservations WHERE date = ? ORDER BY created_at ASC");
                $stmt->execute([$_GET['date']]);
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } elseif (isset($_GET['month']) && isset($_GET['year'])) {
                // Get reservations for specific month
                $stmt = $db->prepare("SELECT * FROM mom_reservations WHERE MONTH(date) = ? AND YEAR(date) = ? ORDER BY date ASC, created_at ASC");
                $stmt->execute([$_GET['month'], $_GET['year']]);
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                // Get all reservations
                $stmt = $db->prepare("SELECT * FROM mom_reservations ORDER BY date DESC, created_at ASC");
                $stmt->execute();
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            }
            break;

        case 'POST':
            // Create new reservation
            if (!isset($input['date']) || !isset($input['client_name'])) {
                throw new Exception('Date and client name are required');
            }

            // Check current reservation count for the date
            $stmt = $db->prepare("
                SELECT 
                    COALESCE(ca.max_reservations, 3) as max_reservations,
                    COUNT(r.id) as current_count
                FROM consultation_availability ca
                LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                WHERE ca.date = ?
                GROUP BY ca.date, ca.max_reservations
            ");
            $stmt->execute([$input['date']]);
            $availability = $stmt->fetch();

            if (!$availability) {
                // No availability record exists, check for default setting
                $stmt = $db->prepare("SELECT max_reservations FROM consultation_availability WHERE date = '0000-00-00'");
                $stmt->execute();
                $defaultSetting = $stmt->fetch();
                $defaultMax = $defaultSetting ? $defaultSetting['max_reservations'] : 3;
                
                $stmt = $db->prepare("SELECT COUNT(*) as current_count FROM mom_reservations WHERE date = ? AND status != 'cancelled'");
                $stmt->execute([$input['date']]);
                $current = $stmt->fetch();
                $availability = ['max_reservations' => $defaultMax, 'current_count' => $current['current_count']];
            }

            if ($availability['current_count'] >= $availability['max_reservations']) {
                throw new Exception('Maximum reservations reached for this date');
            }

            // Create the reservation
            $stmt = $db->prepare("INSERT INTO mom_reservations (date, client_name, client_phone, status, notes) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['date'],
                $input['client_name'],
                $input['client_phone'] ?? null,
                $input['status'] ?? 'pending',
                $input['notes'] ?? null
            ]);

            $reservationId = $db->lastInsertId();

            // Check if we need to update availability status
            $newCount = $availability['current_count'] + 1;
            if ($newCount >= $availability['max_reservations']) {
                // Update or create availability record to mark as full
                $stmt = $db->prepare("
                    INSERT INTO consultation_availability (date, status, max_reservations) 
                    VALUES (?, 'full', ?) 
                    ON DUPLICATE KEY UPDATE status = 'full'
                ");
                $stmt->execute([$input['date'], $availability['max_reservations']]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Reservation created successfully',
                'id' => $reservationId,
                'remaining_slots' => $availability['max_reservations'] - $newCount
            ]);
            break;

        case 'PUT':
            // Update existing reservation
            if (!isset($input['id'])) {
                throw new Exception('ID is required');
            }

            $fields = [];
            $values = [];
            
            if (isset($input['client_name'])) {
                $fields[] = "client_name = ?";
                $values[] = $input['client_name'];
            }
            if (isset($input['client_phone'])) {
                $fields[] = "client_phone = ?";
                $values[] = $input['client_phone'];
            }
            if (isset($input['status'])) {
                $fields[] = "status = ?";
                $values[] = $input['status'];
            }
            if (isset($input['notes'])) {
                $fields[] = "notes = ?";
                $values[] = $input['notes'];
            }

            if (empty($fields)) {
                throw new Exception('No fields to update');
            }

            $values[] = $input['id'];
            $stmt = $db->prepare("UPDATE mom_reservations SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);

            if ($stmt->rowCount() > 0) {
                // If status was changed to cancelled, check if we need to update availability
                if (isset($input['status']) && $input['status'] === 'cancelled') {
                    // Get the reservation date
                    $stmt = $db->prepare("SELECT date FROM mom_reservations WHERE id = ?");
                    $stmt->execute([$input['id']]);
                    $reservation = $stmt->fetch();
                    
                    if ($reservation) {
                        // Check current count after cancellation
                        $stmt = $db->prepare("
                            SELECT 
                                COALESCE(ca.max_reservations, 3) as max_reservations,
                                COUNT(r.id) as current_count
                            FROM consultation_availability ca
                            LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                            WHERE ca.date = ?
                            GROUP BY ca.date, ca.max_reservations
                        ");
                        $stmt->execute([$reservation['date']]);
                        $availability = $stmt->fetch();
                        
                        if ($availability && $availability['current_count'] < $availability['max_reservations']) {
                            // Update availability status back to available
                            $stmt = $db->prepare("UPDATE consultation_availability SET status = 'available' WHERE date = ?");
                            $stmt->execute([$reservation['date']]);
                        }
                    }
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Reservation updated successfully'
                ]);
            } else {
                throw new Exception('Reservation not found');
            }
            break;

        case 'DELETE':
            // Delete reservation
            if (!isset($input['id'])) {
                throw new Exception('ID is required');
            }

            // Get reservation details before deletion
            $stmt = $db->prepare("SELECT date FROM mom_reservations WHERE id = ?");
            $stmt->execute([$input['id']]);
            $reservation = $stmt->fetch();

            if (!$reservation) {
                throw new Exception('Reservation not found');
            }

            $stmt = $db->prepare("DELETE FROM mom_reservations WHERE id = ?");
            $stmt->execute([$input['id']]);

            if ($stmt->rowCount() > 0) {
                // Check if we need to update availability status
                $stmt = $db->prepare("
                    SELECT 
                        COALESCE(ca.max_reservations, 3) as max_reservations,
                        COUNT(r.id) as current_count
                    FROM consultation_availability ca
                    LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                    WHERE ca.date = ?
                    GROUP BY ca.date, ca.max_reservations
                ");
                $stmt->execute([$reservation['date']]);
                $availability = $stmt->fetch();
                
                if ($availability && $availability['current_count'] < $availability['max_reservations']) {
                    // Update availability status back to available
                    $stmt = $db->prepare("UPDATE consultation_availability SET status = 'available' WHERE date = ?");
                    $stmt->execute([$reservation['date']]);
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Reservation deleted successfully'
                ]);
            } else {
                throw new Exception('Reservation not found');
            }
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>