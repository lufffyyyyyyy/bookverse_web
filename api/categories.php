<?php
require_once __DIR__ . '/db.php';

$res = $conn->query("SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category <> '' ORDER BY category");
$cats = [];
while ($r = $res->fetch_assoc()) $cats[] = $r['category'];

json_response(['categories' => $cats]);
