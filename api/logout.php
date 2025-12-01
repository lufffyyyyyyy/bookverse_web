<?php
require_once __DIR__ . '/db.php';

// Ensure session is started before destroying
if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }

// Wipe session data
$_SESSION = [];

// Also expire the session cookie on the browser
if (ini_get('session.use_cookies')) {
  $p = session_get_cookie_params();
  setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
}

session_destroy();

// Send no-cache so browsers don’t reuse old /api/me.php responses
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

json_response(['ok' => true]);
