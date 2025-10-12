<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

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
        // Get all workshops or single workshop
        $id = $_GET['id'] ?? null;
        
        try {
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM mom_workshops WHERE id = ?");
                $stmt->execute([$id]);
                $workshop = $stmt->fetch();
                
                if ($workshop) {
                    // Parse JSON highlights
                    if ($workshop['highlights']) {
                        $workshop['highlights'] = json_decode($workshop['highlights'], true);
                    }
                    echo json_encode(['success' => true, 'workshop' => $workshop]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Workshop not found']);
                }
            } else {
                $stmt = $db->prepare("SELECT * FROM mom_workshops ORDER BY next_date ASC");
                $stmt->execute();
                $workshops = $stmt->fetchAll();
                
                // Parse JSON highlights for all workshops
                foreach ($workshops as &$workshop) {
                    if ($workshop['highlights']) {
                        $workshop['highlights'] = json_decode($workshop['highlights'], true);
                    }
                }
                
                echo json_encode(['success' => true, 'workshops' => $workshops]);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch workshops: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new workshop
        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $duration = $input['duration'] ?? '';
        $type = $input['type'] ?? 'ورشة تدريبية';
        $next_date = $input['next_date'] ?? '';
        $location = $input['location'] ?? '';
        $highlights = $input['highlights'] ?? [];
        $price = $input['price'] ?? 0.00;
        $image_url = $input['image_url'] ?? null;
        $max_participants = $input['max_participants'] ?? 50;

        if (empty($title) || empty($description) || empty($duration) || empty($next_date) || empty($location)) {
            echo json_encode(['success' => false, 'message' => 'Title, description, duration, next_date and location are required']);
            exit;
        }

        try {
            // Convert highlights array to JSON
            $highlights_json = json_encode($highlights, JSON_UNESCAPED_UNICODE);
            
            $stmt = $db->prepare("INSERT INTO mom_workshops (title, description, duration, type, next_date, location, highlights, price, image_url, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $duration, $type, $next_date, $location, $highlights_json, $price, $image_url, $max_participants]);

            $workshopId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Workshop created successfully',
                'workshop' => [
                    'id' => $workshopId,
                    'title' => $title,
                    'description' => $description,
                    'duration' => $duration,
                    'type' => $type,
                    'next_date' => $next_date,
                    'location' => $location,
                    'highlights' => $highlights,
                    'price' => $price,
                    'image_url' => $image_url,
                    'max_participants' => $max_participants
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create workshop: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update workshop
        $id = $input['id'] ?? null;
        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $duration = $input['duration'] ?? '';
        $type = $input['type'] ?? 'ورشة تدريبية';
        $next_date = $input['next_date'] ?? '';
        $location = $input['location'] ?? '';
        $highlights = $input['highlights'] ?? [];
        $price = $input['price'] ?? 0.00;
        $image_url = $input['image_url'] ?? null;
        $max_participants = $input['max_participants'] ?? 50;
        $status = $input['status'] ?? 'active';

        if (!$id || empty($title) || empty($description) || empty($duration) || empty($next_date) || empty($location)) {
            echo json_encode(['success' => false, 'message' => 'ID, title, description, duration, next_date and location are required']);
            exit;
        }

        try {
            // Convert highlights array to JSON
            $highlights_json = json_encode($highlights, JSON_UNESCAPED_UNICODE);
            
            $stmt = $db->prepare("UPDATE mom_workshops SET title = ?, description = ?, duration = ?, type = ?, next_date = ?, location = ?, highlights = ?, price = ?, image_url = ?, max_participants = ?, status = ? WHERE id = ?");
            $stmt->execute([$title, $description, $duration, $type, $next_date, $location, $highlights_json, $price, $image_url, $max_participants, $status, $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Workshop updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Workshop not found or no changes made']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update workshop: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete workshop
        $id = $input['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Workshop ID required']);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM mom_workshops WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Workshop deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Workshop not found']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete workshop: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>