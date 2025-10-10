<?php
require_once 'config.php';

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Device detection function
function detectDevice($userAgent) {
    $mobile = preg_match('/(android|iphone|ipad|mobile|tablet)/i', $userAgent);
    $tablet = preg_match('/(tablet|ipad)/i', $userAgent);
    
    if ($tablet) return 'tablet';
    if ($mobile) return 'mobile';
    return 'desktop';
}

// Browser detection function  
function detectBrowser($userAgent) {
    if (preg_match('/Edge/i', $userAgent)) return 'Microsoft Edge';
    if (preg_match('/Firefox/i', $userAgent)) return 'Firefox';
    if (preg_match('/Chrome/i', $userAgent)) return 'Chrome';
    if (preg_match('/Safari/i', $userAgent)) return 'Safari';
    if (preg_match('/Opera/i', $userAgent)) return 'Opera';
    return 'Unknown';
}

// OS detection function
function detectOS($userAgent) {
    if (preg_match('/Windows NT/i', $userAgent)) return 'Windows';
    if (preg_match('/Mac OS X/i', $userAgent)) return 'macOS';
    if (preg_match('/Linux/i', $userAgent)) return 'Linux';
    if (preg_match('/Android/i', $userAgent)) return 'Android';
    if (preg_match('/iPhone|iPad/i', $userAgent)) return 'iOS';
    return 'Unknown';
}

// Bot detection function
function isBot($userAgent) {
    $bots = ['bot', 'crawler', 'spider', 'crawling', 'facebook', 'google', 'yahoo', 'bing'];
    foreach ($bots as $bot) {
        if (stripos($userAgent, $bot) !== false) return true;
    }
    return false;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Handle GET requests for fetching visitor data
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT * FROM mom_track_visitors ORDER BY visit_date DESC LIMIT 1000";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $visitors
        ]);
        exit;
    }
    
    // Only allow POST requests for tracking
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only GET and POST methods allowed');
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page_visited'])) {
        throw new Exception('Page name is required');
    }
    
    $page_visited = $input['page_visited'];
    $referrer = $input['referrer'] ?? 'Direct';
    $user_location = $input['user_location'] ?? [];
    
    // Enhanced visitor info extraction
    $ip_address = $user_location['ip'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $city = $user_location['city'] ?? 'Unknown';
    $country = $user_location['country'] ?? 'Unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // Generate session ID if not provided
    if (!session_id()) {
        session_start();
    }
    $session_id = session_id() ?: uniqid('sess_', true);
    
    // Device and browser detection
    $device_type = detectDevice($user_agent);
    $browser = detectBrowser($user_agent);
    $operating_system = detectOS($user_agent);
    $is_mobile = in_array($device_type, ['mobile', 'tablet']);
    $is_bot = isBot($user_agent);
    
    // Additional data from frontend
    $screen_resolution = $input['screen_resolution'] ?? null;
    $language = $input['language'] ?? $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? null;
    $time_on_page = $input['time_on_page'] ?? null;
    
    // Data validation and cleaning
    $city = trim($city);
    $country = trim($country);
    $referrer = trim($referrer);
    
    // Extract language code (first 2 chars)
    if ($language) {
        $language = substr($language, 0, 2);
    }
    
    // Ensure we have valid country data
    if (empty($country) || $country === 'Unknown') {
        $country = 'Tunisia'; // Default fallback
    }
    
    // Ensure we have valid city data  
    if (empty($city) || $city === 'Unknown') {
        $city = 'Tunis'; // Default city for Tunisia
    }
    
    // Skip admin pages
    if (strpos(strtolower($page_visited), 'admin') !== false) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Admin page - tracking skipped'
        ]);
        exit;
    }
    
    // Skip bot traffic (optional)
    if ($is_bot) {
        echo json_encode([
            'status' => 'success', 
            'message' => 'Bot traffic - tracking skipped'
        ]);
        exit;
    }
    
    // Check if this visitor has already been tracked in this session
    $checkQuery = "SELECT id FROM mom_track_visitors WHERE session_id = :session_id AND page_visited = :page_visited LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':session_id', $session_id);
    $checkStmt->bindParam(':page_visited', $page_visited);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Visit already tracked for this session'
        ]);
        exit;
    }
    
    // Log the data being inserted for debugging
    error_log("Tracking visitor: IP={$ip_address}, Country={$country}, City={$city}, Page={$page_visited}, Device={$device_type}, Browser={$browser}");
    
    $insertQuery = "
        INSERT INTO mom_track_visitors 
        (ip_address, page_visited, referrer, user_agent, city, country, session_id, 
         device_type, browser, operating_system, screen_resolution, language, 
         time_on_page, is_mobile, is_bot) 
        VALUES (:ip_address, :page_visited, :referrer, :user_agent, :city, :country, :session_id,
                :device_type, :browser, :operating_system, :screen_resolution, :language,
                :time_on_page, :is_mobile, :is_bot)
    ";
    
    $stmt = $db->prepare($insertQuery);
    $stmt->bindParam(':ip_address', $ip_address);
    $stmt->bindParam(':page_visited', $page_visited);
    $stmt->bindParam(':referrer', $referrer);
    $stmt->bindParam(':user_agent', $user_agent);
    $stmt->bindParam(':city', $city);
    $stmt->bindParam(':country', $country);
    $stmt->bindParam(':session_id', $session_id);
    $stmt->bindParam(':device_type', $device_type);
    $stmt->bindParam(':browser', $browser);
    $stmt->bindParam(':operating_system', $operating_system);
    $stmt->bindParam(':screen_resolution', $screen_resolution);
    $stmt->bindParam(':language', $language);
    $stmt->bindParam(':time_on_page', $time_on_page);
    $stmt->bindParam(':is_mobile', $is_mobile, PDO::PARAM_BOOL);
    $stmt->bindParam(':is_bot', $is_bot, PDO::PARAM_BOOL);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Visit tracked successfully',
            'data' => [
                'ip' => $ip_address,
                'city' => $city,
                'country' => $country,
                'page' => $page_visited,
                'referrer' => $referrer,
                'device_type' => $device_type,
                'browser' => $browser,
                'os' => $operating_system,
                'is_mobile' => $is_mobile,
                'date' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        throw new Exception('Failed to insert visitor data into database');
    }

} catch (Exception $e) {
    error_log("Error in track_visitors.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error tracking visit: ' . $e->getMessage()
    ]);
}
?>