<?php
// index.php · eKYC application home page
//
// Connects to the database and lists the tables it can see.
// The ekyc_applications table is created manually in the database (see assignment
// section 08b), not here — so this page stays simple and read-only.

$banner = getenv('APP_BANNER')        ?: 'eKYC Application Service';
$engine = getenv('DATABASE_ENGINE')   ?: 'mysql';
$host   = getenv('DATABASE_HOST')     ?: 'localhost';
$port   = getenv('DATABASE_PORT')     ?: ($engine === 'pgsql' ? 5432 : 3306);
$name   = getenv('DATABASE_NAME')     ?: 'sampledb';
$user   = getenv('DATABASE_USER')     ?: 'app';
$pass   = getenv('DATABASE_PASSWORD') ?: '';

$tables = [];
$error  = null;

try {
  $dsn = "$engine:host=$host;port=$port;dbname=$name";
  $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

  $sql = $engine === 'pgsql'
       ? "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
       : "SHOW TABLES";

  foreach ($pdo->query($sql) as $row) {
    $tables[] = $row[0];
  }
} catch (Throwable $e) {
  $error = $e->getMessage();
}
?>
<!doctype html>
<title><?= htmlspecialchars($banner) ?></title>

<h1><?= htmlspecialchars($banner) ?></h1>

<p>This is a simple eKYC application running on OpenShift.</p>

<p>Database host: <b><?= htmlspecialchars($host) ?></b></p>

<?php if ($error): ?>
  <p>Connection failed: <?= htmlspecialchars($error) ?></p>
<?php else: ?>
  <h2>Database Tables (<?= count($tables) ?>)</h2>
  <ul>
    <?php foreach ($tables as $t): ?>
      <li><?= htmlspecialchars($t) ?></li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>

<p>Health check: <a href="/status">/status</a></p>
