<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success'=>false, 'message'=>'Metode tidak diizinkan.']); exit;
}

if (!empty($_POST['website'])) {
  echo json_encode(['success'=>true, 'message'=>'Terima kasih.']); exit;
}

$config = require __DIR__ . '/config.php';

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateDir = sys_get_temp_dir() . '/go_contact_rate';
if (!is_dir($rateDir)) { @mkdir($rateDir, 0777, true); }
$rateFile = $rateDir . '/' . preg_replace('/[^a-z0-9\\.\\-]/i','_', $ip) . '.json';
$now = time();
$window = 3600;
$log = ['ts'=>[]];
if (is_file($rateFile)) {
  $log = json_decode(file_get_contents($rateFile), true) ?: $log;
  $log['ts'] = array_values(array_filter($log['ts'], function($t) use ($now,$window){ return ($now - $t) < $window; }));
}
if (count($log['ts']) >= (int)($config['rate_limit']['max_per_hour'] ?? 3)) {
  http_response_code(429);
  echo json_encode(['success'=>false, 'message'=>'Terlalu banyak percobaan. Coba lagi nanti.']); exit;
}

$recaptchaToken = $_POST['g-recaptcha-response'] ?? '';
if (!$recaptchaToken) {
  echo json_encode(['success'=>false, 'message'=>'Verifikasi keamanan gagal (token kosong).']); exit;
}
$secret = $config['recaptcha']['secret_key'];

if (!function_exists('curl_init')) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'cURL PHP extension belum aktif di server.'
  ]);
  exit;
}

$verify = curl_init();
curl_setopt_array($verify, [
  CURLOPT_URL => 'https://www.google.com/recaptcha/api/siteverify',
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POSTFIELDS => http_build_query([
    'secret' => $secret,
    'response' => $recaptchaToken,
    'remoteip' => $ip
  ])
]);
$response = curl_exec($verify);
$err = curl_error($verify);
curl_close($verify);
if ($err) {
  echo json_encode(['success'=>false, 'message'=>'Tidak bisa memverifikasi reCAPTCHA.']); exit;
}
$rec = json_decode($response, true);
if (!($rec['success'] ?? false)) {
  echo json_encode(['success'=>false, 'message'=>'Verifikasi reCAPTCHA gagal.']); exit;
}
if (($rec['score'] ?? 0) < (float)$config['recaptcha']['min_score']) {
  echo json_encode(['success'=>false, 'message'=>'Skor reCAPTCHA terlalu rendah.']); exit;
}

$required = ['name','email','phone','message'];
foreach ($required as $r) {
  if (empty($_POST[$r])) {
    echo json_encode(['success'=>false, 'message'=>'Harap lengkapi semua bidang yang wajib diisi.']); exit;
  }
}
$name    = trim($_POST['name']);
$email   = trim($_POST['email']);
$phone = $_POST['phone'] ?? '';
if (!preg_match('/^[0-9]+$/', $phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nomor telepon hanya boleh angka.'
    ]);
    exit;
}
$message = trim($_POST['message']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['success'=>false, 'message'=>'Alamat email tidak valid.']); exit;
}

$body  = '<h3>Halo, Saya ingin mengetahui lebih lanjut terkait perumahan Grand Ontama.</h3>';
$body .= '<p><strong>Nama :</strong> '.htmlspecialchars($name).'</p>';
$body .= '<p><strong>Email :</strong> '.htmlspecialchars($email).'</p>';
$body .= '<p><strong>No Telepon :</strong> '.htmlspecialchars($phone).'</p>';
$body .= '<p><strong>Isi Pesan :</strong> '.htmlspecialchars($message).'</p>';

try {
  $autoload = __DIR__ . '/../vendor/autoload.php';
  if (!is_file($autoload)) {
    throw new Exception('PHPMailer belum terpasang. Jalankan: composer require phpmailer/phpmailer');
  }
  require $autoload;

  $mail = new PHPMailer\PHPMailer\PHPMailer(true);
  $mail->isSMTP();
  $mail->Host       = $config['smtp']['host'];
  $mail->SMTPAuth   = true;
  $mail->Username   = $config['smtp']['username'];
  $mail->Password   = $config['smtp']['password'];
  $mail->SMTPSecure = $config['smtp']['encryption']; 
  $mail->Port       = (int)$config['smtp']['port'];

  $mail->setFrom($config['smtp']['from_email'], $config['smtp']['from_name']);
  $mail->addAddress($config['to']['email'], $config['to']['name']);


  $mail->addReplyTo($email, $name);

  $mail->isHTML(true);
  $mail->SMTPDebug = 2;
$mail->Debugoutput = function($str, $level) {
  error_log("SMTP[$level]: $str");
};
  $subjectName = $name ?: 'Pengunjung';

  $mail->Subject = 'Pesan dari ' . $subjectName . ' via Website Grand Ontama';
  $mail->Body    = $body;
  $mail->AltBody = strip_tags(str_replace(['<br>','<br/>','<br />'], "\n", $body));

  $mail->send();

  $log['ts'][] = $now;
  @file_put_contents($rateFile, json_encode($log));

  echo json_encode(['success'=>true, 'message'=>'Terima kasih! Pesan Anda telah terkirim.']);
} catch (Throwable $e) {
  error_log('SEND CONTACT ERROR: ' . $e->getMessage());
  error_log('SEND CONTACT TRACE: ' . $e->getTraceAsString());

  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Pengiriman email gagal: ' . $e->getMessage()
  ]);
  exit;
}

