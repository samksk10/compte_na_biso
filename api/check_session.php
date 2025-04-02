<?php
session_start();
header("Content-Type: application/json");

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode([
        "connected" => false,
        "error" => "Utilisateur non connecté"
    ]);
    exit;
}

// Si connecté, retourner les infos de l'utilisateur
echo json_encode([
    "connected" => true,
    "user_id" => $_SESSION['user_id'],
    "nom" => $_SESSION['nom'] ?? '',
    "email" => $_SESSION['email'] ?? '',
    "role" => $_SESSION['role']
]);
exit;
?>
