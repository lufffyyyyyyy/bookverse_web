<?php
require_once __DIR__ . '/db.php';

$uid = current_user_id();
if (!$uid) json_response(['reviews' => []]);

$sql = "
  SELECT
    r.book_id,
    b.title,
    CASE
      WHEN b.cover_url IS NULL OR b.cover_url='' THEN NULL
      WHEN LEFT(b.cover_url, 4)='http' THEN b.cover_url
      ELSE CONCAT('/public/', TRIM(LEADING '/' FROM b.cover_url))
    END AS cover_url,
    r.rating,
    r.content,
    r.created_at
  FROM reviews r
  JOIN books b ON b.id = r.book_id
  WHERE r.user_id = ?
  ORDER BY r.created_at DESC
";


$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $uid);
$stmt->execute();
$res = $stmt->get_result();

$reviews = [];
while ($row = $res->fetch_assoc()) $reviews[] = $row;


// Handle DELETE request to remove a review
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $book_id = (int)($data['book_id'] ?? 0);

    if (!$book_id) {
        json_response(['error' => 'Missing book ID'], 400);
    }

    $stmt = $conn->prepare("DELETE FROM reviews WHERE user_id = ? AND book_id = ?");
    $stmt->bind_param("ii", $uid, $book_id);
    
    if ($stmt->execute()) {
        json_response(['ok' => true]);
    } else {
        json_response(['error' => 'Failed to delete review'], 500);
    }
}

json_response(['reviews' => $reviews]);
