<?php
require_once __DIR__ . '/db.php';

$q        = trim($_GET['q'] ?? '');
$category = trim($_GET['category'] ?? '');   

$base = "SELECT b.id, b.title, b.author, b.cover_url, b.category,
                COALESCE(r.avg_rating, 0)  AS avg_rating,
                COALESCE(r.cnt, 0)         AS review_count
         FROM books b
         LEFT JOIN (
           SELECT book_id, ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS cnt
           FROM reviews
           GROUP BY book_id
         ) r ON r.book_id = b.id";

$where  = [];
$params = [];
$types  = "";

// title/author search
if ($q !== '') {
  $where[] = "(b.title LIKE ? OR b.author LIKE ?)";
  $like = "%$q%";
  $params[] = $like; $params[] = $like;
  $types .= "ss";
}

// exact category filter (ignore "All")
if ($category !== '' && strcasecmp($category, 'All') !== 0) {
  $where[] = "b.category = ?";
  $params[] = $category;
  $types .= "s";
}

$sql = $base . ( $where ? " WHERE " . implode(" AND ", $where) : "" );

if (empty($where)) {
  $sql .= " ORDER BY RAND() LIMIT 50";
} else {
  $sql .= " ORDER BY b.created_at DESC, b.id DESC LIMIT 50";
}

if ($params) {
  $stmt = $conn->prepare($sql);
  $stmt->bind_param($types, ...$params);
  $stmt->execute();
  $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
  json_response(['books' => $rows]);
} else {
  $res = $conn->query($sql);
  $rows = [];
  while ($r = $res->fetch_assoc()) $rows[] = $r;
  json_response(['books' => $rows]);
}
