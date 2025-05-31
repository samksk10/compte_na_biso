<?php
include "../config.php";
header("Content-Type: application/json");
session_start();

// Fonction utilitaire pour envoyer une réponse JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Vérification que l'utilisateur est connecté
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    jsonResponse(["error" => "Accès refusé : utilisateur non connecté"], 403);
}

$role = $_SESSION['role'];

// Gestion selon la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ============= CRÉATION COMPTE ANALYTIQUE =============
    
    // Récupérer les données envoyées
    $data = json_decode(file_get_contents("php://input"), true);

    // Validation des champs obligatoires
    if (
        empty($data['T6_NumAnal']) ||
        empty($data['T6_CodeAnal']) ||
        empty($data['T6_DesiAnal']) ||
        empty($data['T6_DateAnal'])
    ) {
        jsonResponse(["error" => "Veuillez remplir tous les champs obligatoires."], 400);
    }

    try {
        // Nettoyer les données
        $numAnal = trim($data['T6_NumAnal']);
        $codeAnal = trim(strtoupper($data['T6_CodeAnal']));
        $desiAnal = trim($data['T6_DesiAnal']);
        $dateAnal = trim($data['T6_DateAnal']);

        // Vérifier si le compte existe déjà
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM comptes_analytiques WHERE num_anal = ? OR code_anal = ?");
        $stmt->execute([$numAnal, $codeAnal]);
        if ($stmt->fetchColumn() > 0) {
            jsonResponse(["error" => "Un compte avec ce numéro ou ce code existe déjà"], 409);
        }

        // Insérer le nouveau compte
        $stmt = $pdo->prepare("
            INSERT INTO comptes_analytiques (num_anal, code_anal, desi_anal, date_anal) 
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([$numAnal, $codeAnal, $desiAnal, $dateAnal]);

        jsonResponse([
            "success" => true,
            "message" => "Compte analytique créé avec succès",
            "data" => [
                "num_anal" => $numAnal,
                "code_anal" => $codeAnal,
                "desi_anal" => $desiAnal,
                "date_anal" => $dateAnal
            ]
        ]);

    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur serveur : " . $e->getMessage()], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ============= RÉCUPÉRATION DES COMPTES ANALYTIQUES =============
    try {
        if (isset($_GET['code'])) {
            $stmt = $pdo->prepare("SELECT * FROM comptes_analytiques WHERE code_anal = ?");
            $stmt->execute([$_GET['code']]);
            $compte = $stmt->fetch(PDO::FETCH_ASSOC);
            jsonResponse(["data" => $compte]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM comptes_analytiques ORDER BY num_anal ASC");
            $stmt->execute();
            $comptes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonResponse(["data" => $comptes]);
        }
    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur serveur: " . $e->getMessage()], 500);
    }

} else {
    // Méthode non supportée
    jsonResponse(["error" => "Méthode non autorisée"], 405);
}
?>