<?php
/**
 * Internal QA Syntax Checker
 */
$di = new RecursiveDirectoryIterator(__DIR__);
$it = new RecursiveIteratorIterator($di);
$regex = new RegexIterator($it, '/^.+\.php$/i', RecursiveRegexIterator::GET_MATCH);

$errors = [];
foreach ($regex as $file) {
    $path = $file[0];
    $output = [];
    $return = 0;
    exec("php -l " . escapeshellarg($path), $output, $return);
    if ($return !== 0) {
        $errors[] = $output[0];
    }
}

header('Content-Type: application/json');
if (empty($errors)) {
    echo json_encode(['status' => 'success', 'message' => 'All files are syntactically correct.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'errors' => $errors]);
}
