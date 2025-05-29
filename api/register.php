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

// Vérifier que seul le super_admin a accès
if ($currentUserRole !== 'super_admin') {
    echo json_encode(["error" => "Accès refusé"]);
    exit;
}

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Récupérer un admin spécifique
            $stmt = $pdo->prepare("SELECT id, nom, email FROM users WHERE id = ? AND role = 'admin'");
            $stmt->execute([$_GET['id']]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($admin);
        } else {
            // Récupérer tous les admins
            $stmt = $pdo->query("SELECT id, nom, email FROM users WHERE role = 'admin'");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['nom'], $data['email'], $data['password'])) {
            echo json_encode(["error" => "Données incomplètes"]);
            exit;
        }

        $nom = $data['nom'];
        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $newUserRole = "admin";

        // Vérifier si l'email existe déjà
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(["error" => "Cet email est déjà utilisé"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$nom, $email, $password, $newUserRole])) {
            echo json_encode(["message" => "Administrateur ajouté avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de l'ajout"]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id'], $data['nom'], $data['email'])) {
            echo json_encode(["error" => "Données incomplètes"]);
            exit;
        }

        $updateFields = ["nom = ?", "email = ?"];
        $params = [$data['nom'], $data['email']];

        // Si un nouveau mot de passe est fourni, l'ajouter à la mise à jour
        if (!empty($data['password'])) {
            $updateFields[] = "password = ?";
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $params[] = $data['id'];
        
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ? AND role = 'admin'";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute($params)) {
            echo json_encode(["message" => "Administrateur modifié avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de la modification"]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["error" => "ID non fourni"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'admin'");
        if ($stmt->execute([$_GET['id']])) {
            echo json_encode(["message" => "Administrateur supprimé avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de la suppression"]);
        }
        break;

    default:
        echo json_encode(["error" => "Méthode non autorisée"]);
        break;
}
?>
