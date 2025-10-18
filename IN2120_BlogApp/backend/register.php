<?php
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username']);
$email = trim($data['email']);
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Check if user exists
$stmt = $pdo->prepare("SELECT id FROM user WHERE username = ? OR email = ?");
$stmt->execute([$username, $email]);
if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit;
}

// Insert user
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO user (username, email, password) VALUES (?, ?, ?)");
if ($stmt->execute([$username, $email, $hash])) {
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
?>
