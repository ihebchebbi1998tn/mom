<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

class Database {
    private $host = "spadadtdbuser.mysql.db";
    private $username = "spadadtdbuser";
    private $password = "Dadouhibou2025";
    private $database = "spadadtdbuser";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Connection error: ' . $e->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}
?>