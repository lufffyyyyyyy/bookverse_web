<?php

# ---------- SESSION (cookie visible site-wide) ----------
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
  ]);
  session_start();
}

# ---------- DB CONNECTION ----------
$DB_HOST = 'sql100.infinityfree.com';          // MySQL Host Name
$DB_USER = 'if0_40564530';                     // MySQL User Name
$DB_PASS = 'nxZZYHIM7RoxSfN';                  // Your vPanel / DB password
$DB_NAME = 'if0_40564530_bookverse';           // MySQL DB Name

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}
$conn->set_charset('utf8mb4');

# ---------- HELPERS ----------
function json_response($data, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json');
  // Make sure session writes are flushed before returning
  if (session_status() === PHP_SESSION_ACTIVE) @session_write_close();
  echo json_encode($data);
  exit;
}

function require_json() {
  $raw = file_get_contents('php://input') ?: '';
  $body = json_decode($raw, true);
  if (!is_array($body)) json_response(['error' => 'Invalid JSON body'], 400);
  return $body;
}

function current_user_id() {
  return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
}
