<?php
include "../config.php";
header("Content-Type: application/json");
session_start();
error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("SESSION: " . json_encode($_SESSION));
error_log("INPUT: " . file_get_contents("php://input"));


// 📌 Fonction pour renvoyer une réponse JSON propre
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// 🔥 Debugging : Vérification de la session utilisateur
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    jsonResponse(["error" => "Accès refusé : utilisateur non connecté"], 403);
}

$currentUserRole = $_SESSION['role'];
error_log("Rôle de l'utilisateur : " . $currentUserRole);

// 📌 Vérification des permissions
if (!in_array($currentUserRole, ['super_admin', 'admin'])) {
    jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': // 📌 Lire toutes les catégories avec le nom du comptable responsable
        try {
            $stmt = $pdo->query("
                SELECT 
                    t3.T3_NumJournal, 
                    t3.T3_CodeJournal, 
                    t3.T3_NomJournal, 
                    t3.t4_comptable_id,
                    t4.T4_NomComptable 
                FROM t3_categoriejournaux t3
                LEFT JOIN t4_comptable t4 ON t3.t4_comptable_id = t4.T4_NumComptable
                ORDER BY t3.T3_NumJournal ASC
            ");
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonResponse($categories);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de la récupération des catégories : " . $e->getMessage()], 500);
        }
        break;

    case 'POST': // 📌 Ajouter une nouvelle catégorie de journal
    $data = json_decode(file_get_contents("php://input"), true);
    
    error_log("Données reçues (POST) : " . json_encode($data)); // 🔥 Debug

    if (empty($data['T3_CodeJournal']) || empty($data['T3_NomJournal']) || empty($data['t4_comptable_id'])) {
        jsonResponse(["error" => "Données incomplètes"], 400);
    }


        try {
            $stmt = $pdo->prepare("INSERT INTO t3_categoriejournaux (T3_CodeJournal, T3_NomJournal, t4_comptable_id) VALUES (?, ?, ?)");
            $stmt->execute([$data['T3_CodeJournal'], $data['T3_NomJournal'], $data['t4_comptable_id']]);
            jsonResponse(["message" => "Catégorie ajoutée avec succès"], 201);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de l'ajout : " . $e->getMessage()], 500);
        }
        break;

    case 'PUT': // 📌 Modifier une catégorie
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['T3_NumJournal']) || empty($data['T3_CodeJournal']) || empty($data['T3_NomJournal']) || empty($data['t4_comptable_id'])) {
            jsonResponse(["error" => "Données incomplètes"], 400);
        }

        try {
            $stmt = $pdo->prepare("UPDATE t3_categoriejournaux SET T3_CodeJournal = ?, T3_NomJournal = ?, t4_comptable_id = ? WHERE T3_NumJournal = ?");
            $stmt->execute([$data['T3_CodeJournal'], $data['T3_NomJournal'], $data['t4_comptable_id'], $data['T3_NumJournal']]);
            jsonResponse(["message" => "Catégorie mise à jour"]);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de la mise à jour : " . $e->getMessage()], 500);
        }
        break;

    case 'DELETE': // 📌 Supprimer une catégorie
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['T3_NumJournal'])) {
            jsonResponse(["error" => "Données incomplètes"], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM t3_categoriejournaux WHERE T3_NumJournal = ?");
            $stmt->execute([$data['T3_NumJournal']]);
            jsonResponse(["message" => "Catégorie supprimée avec succès"]);
        } catch (Exception $e) {
            jsonResponse(["error" => "Erreur lors de la suppression : " . $e->getMessage()], 500);
        }
        break;

    default:
        jsonResponse(["error" => "Méthode non autorisée"], 405);
        break;
}
?>
