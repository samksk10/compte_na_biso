<?php
session_start();

// 1. Vider toutes les variables de session
$_SESSION = [];

// 2. Supprimer le cookie de session si présent
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 42000,
            'path' => $params["path"],
            'domain' => $params["domain"],
            'secure' => $params["secure"],
            'httponly' => $params["httponly"],
            'samesite' => 'Strict' // Optionnel mais recommandé
        ]
    );
}

// 3. Détruire la session sur le serveur
session_destroy();

// 4. Répondre proprement
header('Content-Type: application/json');
echo json_encode(["message" => "Déconnexion réussie"]);
