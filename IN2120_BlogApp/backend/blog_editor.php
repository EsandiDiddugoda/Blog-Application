<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'You must be logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$title = trim($data['title']);
$content = trim($data['content']);
$blogId = isset($data['id']) ? intval($data['id']) : null;
$userId = $_SESSION['user']['id'];

if ($blogId) {
    // Update blog: Check ownership
    $stmt = $pdo->prepare("SELECT user_id FROM blogPost WHERE id = ?");
    $stmt->execute([$blogId]);
    $blog = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$blog || $blog['user_id'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE blogPost SET title = ?, content = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$title, $content, $blogId]);
    echo json_encode(['success' => true, 'message' => 'Blog updated']);
} else {
    // Create new blog
    $stmt = $pdo->prepare("INSERT INTO blogPost (user_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $title, $content]);
    echo json_encode(['success' => true, 'message' => 'Blog created']);
}
?>
