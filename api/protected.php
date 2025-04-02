<?php
session_start();
header("Content-Type: application/json");

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Accès refusé : utilisateur non connecté"]);
    exit;
}

// Récupérer les informations de l'utilisateur connecté
$userInfo = [
    "user_id" => $_SESSION['user_id'],
    "nom" => $_SESSION['nom'],
    "email" => $_SESSION['email'],
    "role" => $_SESSION['role']
];

// Exemple : Vérifier si l'utilisateur a un rôle spécifique pour accéder à une ressource
$requiredRole = "admin"; // Rôle requis pour accéder à cette ressource
if ($_SESSION['role'] !== $requiredRole && $_SESSION['role'] !== 'super_admin') {
    echo json_encode(["error" => "Accès refusé : permissions insuffisantes"]);
    exit;
}

// Renvoyer les informations de l'utilisateur connecté
echo json_encode([
    "message" => "Vous êtes connecté",
    "user" => $userInfo
]);
?>