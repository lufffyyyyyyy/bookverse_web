<?php
require_once __DIR__ . '/db.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'Method not allowed'],405);

$body = require_json();
$email = trim($body['email'] ?? '');
$pass  = $body['password'] ?? '';

$stmt = $conn->prepare("SELECT id, password_hash, name FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($row = $res->fetch_assoc()) {
  if (password_verify($pass, $row['password_hash'])) {
    session_regenerate_id(true);      
    $_SESSION['user_id'] = (int)$row['id'];
    $_SESSION['name']    = $row['name'];
    json_response(['ok'=>true, 'name'=>$row['name']]); 
  }
}
json_response(['ok'=>false, 'error'=>'Invalid credentials'],401);
