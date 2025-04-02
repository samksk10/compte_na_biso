<?php
include "../config.php";
header("Content-Type: application/json");

// Démarrer une session PHP
session_start();

// Récupérer les données envoyées en JSON
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = $data['password'];

    // Vérifier si l'email existe dans la base
    $stmt = $pdo->prepare("SELECT id, nom, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Stocker les informations de l'utilisateur dans la session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['nom'] = $user['nom'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role']; // super_admin, admin, ou comptable

        // Renvoyer une réponse JSON avec les informations de l'utilisateur
        echo json_encode([
            "message" => "Connexion réussie",
            "role" => $user['role'], // Renvoie le rôle exact
            "nom" => $user['nom'],
            "user_id" => $user['id'] // Renvoie l'ID de l'utilisateur
        ]);
    } else {
        echo json_encode(["error" => "Identifiants incorrects"]);
    }
} else {
    echo json_encode(["error" => "Données incomplètes"]);
}
?>