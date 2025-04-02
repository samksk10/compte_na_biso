<?php
include "../config.php";
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Vérification de la session
error_log("Session actuelle : " . json_encode($_SESSION));

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    jsonResponse(["error" => "Accès refusé : utilisateur non connecté"], 403);
}

$currentUserRole = $_SESSION['role'];
if (!in_array($currentUserRole, ['super_admin', 'admin'])) {
    jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['search'])) {
                $search = "%" . $_GET['search'] . "%";
                $stmt = $pdo->prepare("SELECT T4_NumComptable, T4_CodeComptable, T4_NomComptable, T4_DateDebutComptable, T4_Email 
                                       FROM t4_comptable 
                                       WHERE T4_NomComptable LIKE ? OR T4_Email LIKE ? OR T4_CodeComptable LIKE ? 
                                       ORDER BY T4_NumComptable ASC");
                $stmt->execute([$search, $search, $search]);
            } else {
                $stmt = $pdo->query("SELECT T4_NumComptable, T4_CodeComptable, T4_NomComptable, T4_DateDebutComptable, T4_Email FROM t4_comptable ORDER BY T4_NumComptable ASC");
            }

            $comptables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonResponse($comptables);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de la récupération des comptables"], 500);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        error_log("Données reçues (POST) : " . json_encode($data));

        if (empty($data['T4_CodeComptable']) || empty($data['T4_MotDePasseCompta']) || empty($data['T4_DateDebutComptable']) || empty($data['T4_NomComptable']) || empty($data['T4_Email']) || empty($data['T4_Role'])) {
            jsonResponse(["error" => "Données incomplètes"], 400);
        }

        try {
            // Vérifier si le code comptable ou l'email existent déjà (dans t4_comptable ou users)
            $stmt = $pdo->prepare("
                SELECT 1 FROM t4_comptable WHERE T4_CodeComptable = ? 
                UNION 
                SELECT 1 FROM users WHERE email = ?
            ");
            $stmt->execute([$data['T4_CodeComptable'], $data['T4_Email']]);

            if ($stmt->fetch()) {
                jsonResponse(["error" => "Le code comptable ou l'email existe déjà"], 400);
            }

            // Hacher le mot de passe
            $passwordHash = password_hash($data['T4_MotDePasseCompta'], PASSWORD_DEFAULT);

            // 🔹 Insérer dans `users`
            $stmt = $pdo->prepare("INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['T4_NomComptable'], $data['T4_Email'], $passwordHash, $data['T4_Role']]);
            $userId = $pdo->lastInsertId();

            // 🔹 Insérer dans `t4_comptable` (sans T4_Role)
            $stmt = $pdo->prepare("INSERT INTO t4_comptable (T4_CodeComptable, T4_MotDePasseCompta, T4_DateDebutComptable, T4_NomComptable, T4_Email, user_id) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['T4_CodeComptable'], $passwordHash, $data['T4_DateDebutComptable'], $data['T4_NomComptable'], $data['T4_Email'], $userId]);

            jsonResponse(["message" => "Comptable ajouté avec succès"], 201);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de l'ajout du comptable : " . $e->getMessage()], 500);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        error_log("Données reçues (PUT) : " . json_encode($data));

        if (empty($data['T4_NumComptable']) || empty($data['T4_NomComptable']) || empty($data['T4_Email'])) {
            jsonResponse(["error" => "Données incomplètes"], 400);
        }

        try {
            // 🔹 Mettre à jour `users`
            $stmt = $pdo->prepare("UPDATE users SET nom = ?, email = ?, role = ? WHERE id = (SELECT user_id FROM t4_comptable WHERE T4_NumComptable = ?)");
            $stmt->execute([$data['T4_NomComptable'], $data['T4_Email'], $data['T4_Role'], $data['T4_NumComptable']]);

            jsonResponse(["message" => "Comptable mis à jour"]);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de la mise à jour"], 500);
        }
        break;

    case 'DELETE':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            error_log("Données reçues (DELETE) : " . json_encode($data));

            if (empty($data['T4_NumComptable'])) {
                jsonResponse(["error" => "ID du comptable manquant"], 400);
            }

            // 🔍 Étape 1 : récupérer user_id lié à ce comptable
            $stmt = $pdo->prepare("SELECT user_id FROM t4_comptable WHERE T4_NumComptable = ?");
            $stmt->execute([$data['T4_NumComptable']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                jsonResponse(["error" => "Comptable non trouvé"], 404);
            }

            $userId = $result['user_id'];

            // 🔍 Étape 2 : supprimer le comptable
            $stmt = $pdo->prepare("DELETE FROM t4_comptable WHERE T4_NumComptable = ?");
            $stmt->execute([$data['T4_NumComptable']]);

            // 🔍 Étape 3 : supprimer l'utilisateur
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            jsonResponse(["message" => "Comptable supprimé avec succès"]);
        } catch (Exception $e) {
            error_log("Erreur DELETE : " . $e->getMessage());
            jsonResponse(["error" => "Erreur lors de la suppression : " . $e->getMessage()], 500);
        }
        break;

    default:
        jsonResponse(["error" => "Méthode non autorisée"], 405);
        break;
}
?>
