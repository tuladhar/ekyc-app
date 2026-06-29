<?php
// status/index.php · Health endpoint for the readiness probe and the grader.
// Reachable at /status (Apache resolves the status/ directory automatically).

$engine = getenv('DATABASE_ENGINE')   ?: 'mysql';
$host   = getenv('DATABASE_HOST')     ?: 'localhost';
$port   = getenv('DATABASE_PORT')     ?: ($engine === 'pgsql' ? 5432 : 3306);
$name   = getenv('DATABASE_NAME')     ?: 'sampledb';
$user   = getenv('DATABASE_USER')     ?: 'app';
$pass   = getenv('DATABASE_PASSWORD') ?: '';

header('Content-Type: text/plain');

try {
  $dsn = "$engine:host=$host;port=$port;dbname=$name";
  $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $pdo->query('SELECT 1');
  echo "DATABASE HEALTHY\nhost: $host\n";
} catch (Throwable $e) {
  http_response_code(503);
  echo "DATABASE UNHEALTHY\nhost: $host\n";
}
