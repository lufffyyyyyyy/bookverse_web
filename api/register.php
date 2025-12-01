<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Method not allowed'], 405);

$body = require_json();
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$pass = $body['password'] ?? '';

if (!$name || !$email || !$pass) json_response(['error' => 'All fields required'], 400);

$hash = password_hash($pass, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users(name, email, password_hash) VALUES(?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hash);

if ($stmt->execute()) {
  json_response(['ok' => true]);
} else {
  json_response(['ok' => false, 'error' => 'Email may already exist'], 409);
}
