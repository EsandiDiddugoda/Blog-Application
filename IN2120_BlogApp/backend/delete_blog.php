<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'You must be logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$blogId = intval($data['id']);
$userId = $_SESSION['user']['id'];

// Check ownership
$stmt = $pdo->prepare("SELECT user_id FROM blogPost WHERE id = ?");
$stmt->execute([$blogId]);
$blog = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$blog || $blog['user_id'] != $userId) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM blogPost WHERE id = ?");
$stmt->execute([$blogId]);
echo json_encode(['success' => true, 'message' => 'Blog deleted']);
?>
