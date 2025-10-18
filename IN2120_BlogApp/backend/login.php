<?php
require 'db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username']);
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM user WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'No account found. Please register first.']);
    exit;
}

if (password_verify($password, $user['password'])) {
    $_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username']];
    echo json_encode(['success' => true, 'message' => 'Login successful']);
} else {
    echo json_encode(['success' => false, 'message' => 'Incorrect password']);
}
?>
