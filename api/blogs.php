<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'DELETE':
            handleDelete();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGet() {
    global $db;
    
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? 'published';
    
    try {
        if ($id) {
            // Get specific blog post
            $stmt = $db->prepare("SELECT * FROM blogs WHERE id = ?");
            $stmt->execute([$id]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($blog) {
                // Increment views for published posts
                if ($blog['status'] === 'published') {
                    $updateStmt = $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
                    $updateStmt->execute([$id]);
                    $blog['views'] = (int)$blog['views'] + 1;
                }
                
                echo json_encode(['success' => true, 'blog' => $blog]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Blog post not found']);
            }
        } else {
            // Get all blog posts
            $whereClause = "";
            $params = [];
            
            if ($status !== 'all') {
                $whereClause = "WHERE status = ?";
                $params[] = $status;
            }
            
            $stmt = $db->prepare("SELECT * FROM blogs $whereClause ORDER BY published_date DESC, created_at DESC");
            $stmt->execute($params);
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert numeric fields
            foreach ($blogs as &$blog) {
                $blog['id'] = (int)$blog['id'];
                $blog['views'] = (int)$blog['views'];
                $blog['likes'] = (int)$blog['likes'];
            }
            
            echo json_encode(['success' => true, 'blogs' => $blogs]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handlePost() {
    global $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $requiredFields = ['title', 'excerpt', 'content', 'category', 'published_date'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
            return;
        }
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO blogs (title, excerpt, content, category, author, published_date, read_time, featured_image, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $success = $stmt->execute([
            $input['title'],
            $input['excerpt'],
            $input['content'],
            $input['category'],
            $input['author'] ?? 'أكاديمية الأم',
            $input['published_date'],
            $input['read_time'] ?? '5 دقائق',
            $input['featured_image'] ?? null,
            $input['status'] ?? 'draft'
        ]);
        
        if ($success) {
            $blogId = $db->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'Blog post created successfully', 'id' => $blogId]);
        } else {
            throw new Exception('Failed to insert blog post');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handlePut() {
    global $db;
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Blog ID is required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Build dynamic update query
        $fields = [];
        $values = [];
        
        $allowedFields = ['title', 'excerpt', 'content', 'category', 'author', 'published_date', 'read_time', 'featured_image', 'status'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $values[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No valid fields to update']);
            return;
        }
        
        $values[] = $id;
        $sql = "UPDATE blogs SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $db->prepare($sql);
        $success = $stmt->execute($values);
        
        if ($success && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Blog post updated successfully']);
        } else if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Blog post not found']);
        } else {
            throw new Exception('Failed to update blog post');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleDelete() {
    global $db;
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Blog ID is required']);
        return;
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM blogs WHERE id = ?");
        $success = $stmt->execute([$id]);
        
        if ($success && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Blog post deleted successfully']);
        } else if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Blog post not found']);
        } else {
            throw new Exception('Failed to delete blog post');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Helper function to increment blog likes
function incrementLikes($blogId) {
    global $db;
    
    try {
        $stmt = $db->prepare("UPDATE blogs SET likes = likes + 1 WHERE id = ?");
        $stmt->execute([$blogId]);
        
        // Return updated likes count
        $stmt = $db->prepare("SELECT likes FROM blogs WHERE id = ?");
        $stmt->execute([$blogId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? (int)$result['likes'] : 0;
    } catch (PDOException $e) {
        return false;
    }
}
?>