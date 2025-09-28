<?php
// proxy.php - Stream a private video from B2
// Usage: proxy.php?file=FILENAME

// --- CONFIG
$B2_KEY_ID      = "1ee1f4b4f61d";  
$B2_APP_KEY     = "005b048df3f42790cedd108dfb9738dbaa95d17d6b"; 
$B2_BUCKET_ID   = "310e9e816fa45b149f96011d";    
$B2_BUCKET_NAME = "momstorage";  

if (!isset($_GET['file'])) {
    http_response_code(400);
    exit("Missing file parameter");
}

$filename = $_GET['file'];

// --- Step 1: Authorize B2
$authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
$ch = curl_init($authUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $B2_KEY_ID . ":" . $B2_APP_KEY);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
$response = curl_exec($ch);
curl_close($ch);
$authData = json_decode($response, true);

if (!$authData || !isset($authData['authorizationToken'])) {
    http_response_code(500);
    exit("B2 authorization failed");
}

$authorizationToken = $authData['authorizationToken'];
$apiUrl             = rtrim($authData['apiUrl'], '/');
$downloadUrl        = rtrim($authData['downloadUrl'], '/');

// --- Step 2: Generate temporary download authorization (1 hour)
$validDurationSeconds = 3600;
$downloadAuthUrl = $apiUrl . "/b2api/v2/b2_get_download_authorization";

$payloadAuth = json_encode([
    "bucketId" => $B2_BUCKET_ID,
    "fileNamePrefix" => $filename,
    "validDurationInSeconds" => $validDurationSeconds
]);

$ch = curl_init($downloadAuthUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadAuth);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: " . $authorizationToken,
    "Content-Type: application/json"
]);
$responseAuth = curl_exec($ch);
curl_close($ch);

$authData = json_decode($responseAuth, true);
$downloadAuthToken = $authData['authorizationToken'] ?? null;

if (!$downloadAuthToken) {
    http_response_code(500);
    exit("Failed to get download authorization");
}

// --- Step 3: Create video folder if it doesn't exist
$videosDir = __DIR__ . '/video';
if (!is_dir($videosDir)) {
    mkdir($videosDir, 0755, true);
}

$localVideoPath = $videosDir . '/' . basename($filename);

// --- Step 4: Check if video already exists locally
if (file_exists($localVideoPath)) {
    // Serve from local cache
    header("Content-Type: video/mp4");
    header("Content-Disposition: inline; filename=\"" . basename($filename) . "\"");
    header("Content-Length: " . filesize($localVideoPath));
    header("Cache-Control: public, max-age=3600");
    header("Accept-Ranges: bytes");
    
    readfile($localVideoPath);
    exit;
}

// --- Step 5: Stream from B2 and save locally simultaneously
$privateUrl = $downloadUrl . "/file/" . rawurlencode($B2_BUCKET_NAME) . "/" . rawurlencode($filename) . "?Authorization=" . $downloadAuthToken;

header("Content-Type: video/mp4");
header("Content-Disposition: inline; filename=\"" . basename($filename) . "\"");
header("Cache-Control: no-cache");
header("Accept-Ranges: bytes");

// Open local file for writing
$localFile = fopen($localVideoPath, 'wb');

// Custom write function that outputs to browser AND saves to local file
function writeFunction($ch, $data) {
    global $localFile;
    
    // Write to browser (stream to user)
    echo $data;
    
    // Write to local file (cache for future use)
    if ($localFile) {
        fwrite($localFile, $data);
    }
    
    return strlen($data);
}

$ch = curl_init($privateUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, 'writeFunction');
curl_exec($ch);
curl_close($ch);

// Close local file
if ($localFile) {
    fclose($localFile);
}
?>