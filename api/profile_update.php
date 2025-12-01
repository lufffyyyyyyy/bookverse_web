<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Method not allowed'], 405);

$uid = current_user_id();
if (!$uid) json_response(['error' => 'Unauthorized'], 401);

$body = require_json();
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$pass = $body['password'] ?? '';

if (!$name || !$email) json_response(['error' => 'Name and Email are required'], 400);

// Check if email is taken by another user
$check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
$check->bind_param("si", $email, $uid);
$check->execute();
if ($check->get_result()->fetch_assoc()) {
    json_response(['error' => 'Email already in use'], 409);
}

// Update
if ($pass) {
    $hash = password_hash($pass, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?");
    $stmt->bind_param("sssi", $name, $email, $hash, $uid);
} else {
    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
    $stmt->bind_param("ssi", $name, $email, $uid);
}

if ($stmt->execute()) {
    // Update session name if changed
    $_SESSION['name'] = $name;
    json_response(['ok' => true]);
} else {
    json_response(['error' => 'Update failed'], 500);
}
