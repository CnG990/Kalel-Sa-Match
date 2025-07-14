<?php

echo "TEST BACKEND API\n";
echo "================\n";

$response = @file_get_contents('http://127.0.0.1:8000/api/terrains/6');
if ($response) {
    echo "✅ Backend accessible\n";
} else {
    echo "❌ Backend inaccessible\n";
} 