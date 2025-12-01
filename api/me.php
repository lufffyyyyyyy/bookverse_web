<?php
require_once __DIR__ . '/db.php';

$uid = current_user_id();
if ($uid) {
  $stmt = $conn->prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
  $stmt->bind_param("i", $uid);
  $stmt->execute();
  $user = $stmt->get_result()->fetch_assoc();
  json_response(['user' => $user]);
}

json_response(['user' => null]);
