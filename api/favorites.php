<?php
require_once __DIR__ . '/db.php';

$uid = current_user_id();
if (!$uid) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        json_response(['favorites' => []]);
    } else {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

// GET: List favorites
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "
        SELECT b.id, b.title, b.author, b.cover_url, b.category,
               COALESCE(r.avg_rating, 0) AS avg_rating,
               COALESCE(r.cnt, 0) AS review_count
        FROM favorites f
        JOIN books b ON f.book_id = b.id
        LEFT JOIN (
            SELECT book_id, ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS cnt
            FROM reviews
            GROUP BY book_id
        ) r ON r.book_id = b.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $uid);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    json_response(['favorites' => $rows]);
}

// POST: Toggle favorite
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = require_json();
    $book_id = (int)($body['book_id'] ?? 0);
    
    if (!$book_id) json_response(['error' => 'Invalid book ID'], 400);

    // Check if exists
    $check = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND book_id = ?");
    $check->bind_param("ii", $uid, $book_id);
    $check->execute();
    
    if ($check->get_result()->fetch_assoc()) {
        // Remove
        $del = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND book_id = ?");
        $del->bind_param("ii", $uid, $book_id);
        $del->execute();
        json_response(['favorited' => false]);
    } else {
        // Add
        $add = $conn->prepare("INSERT INTO favorites (user_id, book_id) VALUES (?, ?)");
        $add->bind_param("ii", $uid, $book_id);
        $add->execute();
        json_response(['favorited' => true]);
    }
}

json_response(['error' => 'Method not allowed'], 405);
