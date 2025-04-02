<?php
include "../config.php";
header("Content-Type: application/json");
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode(["error" => "Non autorisé : utilisateur non connecté"]);
    exit;
}

// Récupérer le rôle de l'utilisateur connecté
$currentUserRole = $_SESSION['role'];

// Vérifier si la requête est en POST (ajout d'un admin)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Vérifier que toutes les données nécessaires sont présentes
    if (!isset($data['nom'], $data['email'], $data['password'])) {
        echo json_encode(["error" => "Données incomplètes"]);
        exit;
    }

    $nom = $data['nom'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $newUserRole = "admin"; // Seul un admin peut être ajouté ici

    // Vérifier que seul le super_admin peut créer un admin
    if ($currentUserRole !== 'super_admin') {
        echo json_encode(["error" => "Seul le super_admin peut ajouter un administrateur"]);
        exit;
    }

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "Cet email est déjà utilisé"]);
        exit;
    }

    // Insérer l'admin dans la table users
    $stmt = $pdo->prepare("INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$nom, $email, $password, $newUserRole])) {
        echo json_encode(["message" => "Administrateur ajouté avec succès"]);
    } else {
        echo json_encode(["error" => "Erreur lors de l'ajout"]);
    }
}

// Vérifier si la requête est GET (Lister les admins)
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!in_array($currentUserRole, ['super_admin', 'admin'])) {
        echo json_encode(["error" => "Accès refusé"]);
        exit;
    }

    $stmt = $pdo->query("SELECT id, nom, email FROM users WHERE role = 'admin'");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// Si autre requête, refuser l'accès
else {
    echo json_encode(["error" => "Méthode non autorisée"]);
}
?>
