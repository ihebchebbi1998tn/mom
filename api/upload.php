<?php
// upload.php
header("Content-Type: application/json");

// --- CONFIG
$B2_KEY_ID      = "a03805f5c6f0";  
$B2_APP_KEY     = "0053fc52618028b14d08bcf60f1ee223fcbdefea87"; 
$B2_BUCKET_ID   = "daf033f8e0e55f159c960f10";    
$B2_BUCKET_NAME = "momapps";   
$MAX_BYTES      = 1000 * 1024 * 1024; // 1000 MB limit

// Log function for debugging
function logMessage($message) {
    // Write to server error log only; do NOT echo into response to keep JSON clean
    error_log("[UPLOAD] " . $message);
}

if (!isset($_FILES['file'])) {
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];

if ($file['size'] <= 0) {
    echo json_encode(["status" => "error", "message" => "Empty file"]);
    exit;
}

if ($file['size'] > $MAX_BYTES) {
    echo json_encode(["status" => "error", "message" => "File too large"]);
    exit;
}

$filename = $file['name'];
$tmpFile  = $file['tmp_name'];

logMessage("Starting upload for file: $filename (size: " . $file['size'] . " bytes)");

// --- Step 1: Authorize B2
$authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
$ch = curl_init($authUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $B2_KEY_ID . ":" . $B2_APP_KEY);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
$response = curl_exec($ch);
curl_close($ch);
$authData = json_decode($response, true);

if (!$authData || !isset($authData['authorizationToken']) || !isset($authData['apiUrl'])) {
    logMessage("B2 authorization failed");
    echo json_encode(["status" => "error", "message" => "B2 authorization failed"]);
    exit;
}

$authorizationToken = $authData['authorizationToken'];
$apiUrl             = rtrim($authData['apiUrl'], '/');
$downloadUrl        = rtrim($authData['downloadUrl'], '/');

logMessage("B2 authorization successful");

// --- Step 2: Get upload URL
$getUploadUrl = $apiUrl . "/b2api/v2/b2_get_upload_url";
$payload = json_encode(["bucketId" => $B2_BUCKET_ID]);
$ch = curl_init($getUploadUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: " . $authorizationToken,
    "Content-Type: application/json"
]);
$response2 = curl_exec($ch);
curl_close($ch);
$uploadData = json_decode($response2, true);

if (!$uploadData || !isset($uploadData['uploadUrl']) || !isset($uploadData['authorizationToken'])) {
    logMessage("Failed to get B2 upload URL");
    echo json_encode(["status" => "error", "message" => "Failed to get B2 upload URL"]);
    exit;
}

logMessage("Got B2 upload URL");

// --- Step 3: Upload file to B2
$uploadUrl = $uploadData['uploadUrl'];
$uploadAuthToken = $uploadData['authorizationToken'];
$fileContents = file_get_contents($tmpFile);

$ch = curl_init($uploadUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContents);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: " . $uploadAuthToken,
    "X-Bz-File-Name: " . rawurlencode($filename),
    "Content-Type: b2/x-auto",
    "X-Bz-Content-Sha1: do_not_verify"
]);
$response3 = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    logMessage("Upload to B2 failed with HTTP code: $httpCode");
    echo json_encode(["status" => "error", "message" => "Upload failed", "http_code" => $httpCode, "response" => $response3]);
    exit;
}

logMessage("Upload to B2 successful");

// --- Step 4: Generate temporary private download URL (1 hour)
$validDurationSeconds = 3600;
$encodedFileName = rawurlencode($filename);
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

$privateUrl = $downloadUrl . "/file/" . rawurlencode($B2_BUCKET_NAME) . "/" . $encodedFileName;
if ($downloadAuthToken) {
    $privateUrl .= "?Authorization=" . $downloadAuthToken;
}

logMessage("Generated private download URL");

// --- Step 5: Cache file locally
$videoDir = __DIR__ . '/video';
if (!is_dir($videoDir)) {
    if (!@mkdir($videoDir, 0755, true)) {
        logMessage("Failed to create video directory: $videoDir");
        // Continue without caching - return proxy URL
        echo json_encode([
            "status" => "success",
            "message" => "File uploaded successfully (cached to proxy)",
            "fileName" => $filename,
            "privateUrl" => $privateUrl,
            "finalUrl" => "https://spadadibattaglia.com/mom/api/proxy.php?file=" . urlencode($filename),
            "cached" => false
        ]);
        exit;
    }
}

$cachedFilePath = $videoDir . '/' . basename($filename);

logMessage("Attempting to cache file locally to: $cachedFilePath");

// Download and cache the file
$ch = curl_init($privateUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutes timeout
$cachedContent = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $cachedContent !== false) {
    if (file_put_contents($cachedFilePath, $cachedContent) !== false) {
        logMessage("Successfully cached file locally. Size: " . strlen($cachedContent) . " bytes");
        
        // Verify the cached file exists and has the right size
        if (file_exists($cachedFilePath) && filesize($cachedFilePath) > 0) {
            $directUrl = "https://spadadibattaglia.com/mom/api/video/" . basename($filename);
            
            logMessage("Cache verification successful. Returning direct URL: $directUrl");
            
            // Return direct URL to cached file
            echo json_encode([
                "status" => "success",
                "message" => "File uploaded and cached successfully",
                "fileName" => $filename,
                "privateUrl" => $privateUrl,
                "finalUrl" => $directUrl,
                "cached" => true,
                "cacheSize" => filesize($cachedFilePath)
            ]);
            exit;
        } else {
            logMessage("Cache verification failed - file doesn't exist or is empty");
        }
    } else {
        logMessage("Failed to write cached file to disk");
    }
} else {
    logMessage("Failed to download file for caching. HTTP code: $httpCode");
}

// If caching failed, fall back to proxy URL
logMessage("Caching failed, returning proxy URL");
echo json_encode([
    "status" => "success",
    "message" => "File uploaded successfully (using proxy)",
    "fileName" => $filename,
    "privateUrl" => $privateUrl,
    "finalUrl" => "https://spadadibattaglia.com/mom/api/proxy.php?file=" . urlencode($filename),
    "cached" => false
]);

?>