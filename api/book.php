<?php
require_once __DIR__ . '/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
  http_response_code(404);
  json_response(['book' => null, 'message' => 'Invalid id']);
}

// fetch book
$stmt = $conn->prepare("SELECT id, title, author, year, isbn, description, cover_url, category
                        FROM books WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$book = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$book) {
  http_response_code(404);
  json_response(['book' => null, 'message' => 'Not found']);
}

// rating stats
$st = $conn->prepare("SELECT ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS cnt
                      FROM reviews WHERE book_id = ?");
$st->bind_param("i", $id);
$st->execute();
$stats = $st->get_result()->fetch_assoc();
$st->close();

// reviews list
$rv = $conn->prepare("SELECT r.id, r.rating, r.content, r.created_at, u.name
                      FROM reviews r
                      JOIN users u ON u.id = r.user_id
                      WHERE r.book_id = ?
                      ORDER BY r.created_at DESC");
$rv->bind_param("i", $id);
$rv->execute();
$reviews = $rv->get_result()->fetch_all(MYSQLI_ASSOC);
$rv->close();

json_response([
  'book'    => $book,
  'stats'   => $stats ?: ['avg_rating' => 0, 'cnt' => 0],
  'reviews' => $reviews
]);
