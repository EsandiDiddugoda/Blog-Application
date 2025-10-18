<?php
require 'db.php';
session_start();

$stmt = $pdo->query("
    SELECT b.id, b.title, b.content, b.created_at, b.updated_at, u.username as author, u.id as user_id
    FROM blogPost b
    JOIN user u ON b.user_id = u.id
    ORDER BY b.created_at DESC
");
$blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$userId = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : null;

echo json_encode(['blogs' => $blogs, 'currentUserId' => $userId]);
?>
