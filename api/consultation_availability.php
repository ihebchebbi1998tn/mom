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
            if (isset($_GET['default']) && $_GET['default'] === 'true') {
                // Get default settings
                $stmt = $db->prepare("SELECT * FROM consultation_availability WHERE date = '0000-00-00'");
                $stmt->execute();
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } elseif (isset($_GET['date'])) {
                // Get specific date availability with reservation count
                $stmt = $db->prepare("
                    SELECT 
                        ca.*,
                        COALESCE(COUNT(r.id), 0) as current_reservations
                    FROM consultation_availability ca
                    LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                    WHERE ca.date = ?
                    GROUP BY ca.id
                ");
                $stmt->execute([$_GET['date']]);
                $result = $stmt->fetch();
                
                if (!$result) {
                    // Check if there are any reservations for this date and get default max
                    $stmt = $db->prepare("SELECT max_reservations FROM consultation_availability WHERE date = '0000-00-00'");
                    $stmt->execute();
                    $defaultSetting = $stmt->fetch();
                    $defaultMax = $defaultSetting ? $defaultSetting['max_reservations'] : 3;
                    
                    $stmt = $db->prepare("SELECT COUNT(*) as current_reservations FROM mom_reservations WHERE date = ? AND status != 'cancelled'");
                    $stmt->execute([$_GET['date']]);
                    $reservationCount = $stmt->fetch();
                    
                    $result = [
                        'date' => $_GET['date'], 
                        'status' => 'available',
                        'max_reservations' => $defaultMax,
                        'current_reservations' => $reservationCount['current_reservations']
                    ];
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } elseif (isset($_GET['month']) && isset($_GET['year'])) {
                // Get month availability with reservation counts
                $stmt = $db->prepare("
                    SELECT 
                        ca.*,
                        COALESCE(COUNT(r.id), 0) as current_reservations
                    FROM consultation_availability ca
                    LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                    WHERE MONTH(ca.date) = ? AND YEAR(ca.date) = ?
                    GROUP BY ca.id
                    ORDER BY ca.date ASC
                ");
                $stmt->execute([$_GET['month'], $_GET['year']]);
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } elseif (isset($_GET['range'])) {
                // Get date range with reservation counts
                $startDate = $_GET['start_date'];
                $endDate = $_GET['end_date'];
                $stmt = $db->prepare("
                    SELECT 
                        ca.*,
                        COALESCE(COUNT(r.id), 0) as current_reservations
                    FROM consultation_availability ca
                    LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                    WHERE ca.date BETWEEN ? AND ?
                    GROUP BY ca.id
                    ORDER BY ca.date ASC
                ");
                $stmt->execute([$startDate, $endDate]);
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                // Get all availability with reservation counts
                $stmt = $db->prepare("
                    SELECT 
                        ca.*,
                        COALESCE(COUNT(r.id), 0) as current_reservations
                    FROM consultation_availability ca
                    LEFT JOIN mom_reservations r ON ca.date = r.date AND r.status != 'cancelled'
                    GROUP BY ca.id
                    ORDER BY ca.date ASC
                ");
                $stmt->execute();
                $result = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            }
            break;

        case 'POST':
            // Create new availability record or update default
            if (!isset($input['date']) || !isset($input['status'])) {
                throw new Exception('Date and status are required');
            }

            if ($input['date'] === '0000-00-00') {
                // Handle default settings - update existing or create new
                $stmt = $db->prepare("SELECT id FROM consultation_availability WHERE date = '0000-00-00'");
                $stmt->execute();
                $existing = $stmt->fetch();

                if ($existing) {
                    // Update existing default
                    $stmt = $db->prepare("UPDATE consultation_availability SET max_reservations = ?, notes = ? WHERE date = '0000-00-00'");
                    $stmt->execute([
                        $input['max_reservations'] ?? 3,
                        $input['notes'] ?? 'إعداد افتراضي عام'
                    ]);
                } else {
                    // Create new default
                    $stmt = $db->prepare("INSERT INTO consultation_availability (date, status, max_reservations, notes) VALUES (?, ?, ?, ?)");
                    $stmt->execute([
                        '0000-00-00',
                        'available',
                        $input['max_reservations'] ?? 3,
                        $input['notes'] ?? 'إعداد افتراضي عام'
                    ]);
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'تم حفظ الإعدادات الافتراضية بنجاح'
                ]);
                break;
            }

            // Regular date-specific availability
            $stmt = $db->prepare("INSERT INTO consultation_availability (date, status, max_reservations, notes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), max_reservations = VALUES(max_reservations), notes = VALUES(notes)");
            $stmt->execute([
                $input['date'],
                $input['status'],
                $input['max_reservations'] ?? 3,
                $input['notes'] ?? null
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث توفر الموعد بنجاح',
                'id' => $db->lastInsertId()
            ]);
            break;

        case 'PUT':
            // Update existing availability
            if (!isset($input['id']) || !isset($input['status'])) {
                throw new Exception('ID and status are required');
            }

            $stmt = $db->prepare("UPDATE consultation_availability SET status = ?, max_reservations = ?, notes = ? WHERE id = ?");
            $stmt->execute([
                $input['status'],
                $input['max_reservations'] ?? 3,
                $input['notes'] ?? null,
                $input['id']
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Availability updated successfully'
                ]);
            } else {
                throw new Exception('Availability record not found');
            }
            break;

        case 'DELETE':
            // Delete availability entry
            if (!isset($input['id'])) {
                throw new Exception('ID is required');
            }

            $stmt = $db->prepare("DELETE FROM consultation_availability WHERE id = ?");
            $stmt->execute([$input['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Availability deleted successfully'
                ]);
            } else {
                throw new Exception('Availability record not found');
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