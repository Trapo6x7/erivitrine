<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Méthode non autorisée.']);
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
    respond(403, ['error' => 'Origine non autorisée.']);
}
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
    respond(415, ['error' => 'Format JSON requis.']);
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) {
    respond(413, ['error' => 'Message trop volumineux.']);
}
$body = json_decode($raw, true);
$messages = is_array($body) ? ($body['messages'] ?? null) : null;
if (!is_array($messages) || !array_is_list($messages) || count($messages) < 1 || count($messages) > 11) {
    respond(400, ['error' => 'Conversation invalide.']);
}
foreach ($messages as $i => $message) {
    $role = $i % 2 === 0 ? 'user' : 'assistant';
    if (!is_array($message) || ($message['role'] ?? '') !== $role || !is_string($message['content'] ?? null)
        || trim($message['content']) === '' || strlen($message['content']) > ($role === 'user' ? 2000 : 6000)) {
        respond(400, ['error' => 'Message invalide.']);
    }
    $messages[$i] = ['role' => $role, 'content' => $message['content']];
}
if (end($messages)['role'] !== 'user') {
    respond(400, ['error' => 'Question manquante.']);
}

// Fichier privé, placé un niveau au-dessus de la racine publique.
$configFile = dirname(__DIR__, 2) . '/groq-config.php';
$config = is_file($configFile) ? require $configFile : [];
$key = getenv('GROQ_API_KEY') ?: ($config['api_key'] ?? '');
$model = getenv('GROQ_MODEL') ?: ($config['model'] ?? 'llama-3.3-70b-versatile');
if (!$key || !extension_loaded('curl')) {
    respond(503, ['error' => 'Assistant indisponible. Contactez-nous au 04 77 23 91 70.']);
}

// Quotas partagés entre processus PHP, sans conserver les conversations.
$limitFile = sys_get_temp_dir() . '/eri-chat-' . hash('sha256', __DIR__) . '.json';
$file = fopen($limitFile, 'c+');
if (!$file || !flock($file, LOCK_EX)) {
    respond(503, ['error' => 'Assistant temporairement indisponible.']);
}
$limits = json_decode(stream_get_contents($file), true) ?: [];
$minute = intdiv(time(), 60);
if (($limits['minute'] ?? 0) !== $minute) $limits = ['minute' => $minute, 'total' => 0, 'clients' => []];
$client = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
if ($limits['total'] >= 60 || ($limits['clients'][$client] ?? 0) >= 10) {
    flock($file, LOCK_UN);
    fclose($file);
    header('Retry-After: 60');
    respond(429, ['error' => 'Trop de demandes. Réessayez dans une minute.']);
}
$limits['total']++;
$limits['clients'][$client] = ($limits['clients'][$client] ?? 0) + 1;
rewind($file);
ftruncate($file, 0);
fwrite($file, json_encode($limits));
fflush($file);
flock($file, LOCK_UN);
fclose($file);

$system = 'Tu es l’assistant du site E-R.I, entreprise informatique à Roanne depuis 1996. Réponds en français, brièvement, en texte simple sans Markdown. '
    . 'Services : maintenance et infogérance, sauvegarde et hébergement, logiciels professionnels, virtualisation, Solution Connect, Mailinblack, développement sur mesure. '
    . 'Contact : contact@e-r-i.fr, 04 77 23 91 70, 4 rue Jean Jaurès, 42300 Roanne. Assistance : https://e-r-i.freshdesk.com/. Espace client : https://cloud.e-r-i.fr/. '
    . 'Aide à préciser le besoin et oriente vers l’équipe. N’invente aucun tarif, délai, horaire ou engagement. Tu ne crées pas de ticket, ne prends pas de rendez-vous et ne consultes aucun dossier client. '
    . 'Ne demande jamais de mot de passe ou de donnée sensible. Si une information manque, dis-le et propose le contact. Reste sur les besoins liés aux services E-R.I.';
$request = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($request, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key, 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => $model,
        'messages' => array_merge([['role' => 'system', 'content' => $system]], $messages),
        'max_completion_tokens' => 600,
        'stream' => false,
    ], JSON_UNESCAPED_UNICODE),
]);
$result = curl_exec($request);
$status = curl_getinfo($request, CURLINFO_HTTP_CODE);
curl_close($request);
if ($result === false || $status !== 200) {
    respond(503, ['error' => 'Assistant temporairement indisponible. Réessayez ou appelez le 04 77 23 91 70.']);
}
$reply = json_decode($result, true)['choices'][0]['message']['content'] ?? null;
if (!is_string($reply) || trim($reply) === '') {
    respond(502, ['error' => 'Réponse indisponible. Réessayez.']);
}
respond(200, ['reply' => $reply]);
