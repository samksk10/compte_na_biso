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

// ✅ Vérification que l'utilisateur est connecté
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    jsonResponse(["error" => "Accès refusé : utilisateur non connecté"], 403);
}

$role = $_SESSION['role'];

// ✅ Gestion selon la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ============= CRÉATION D'ENTREPRISE =============
    
    // ✅ Seuls les super_admin et admin peuvent enregistrer une entreprise
    if (!in_array($role, ['super_admin', 'admin'])) {
        jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
    }

    // ✅ Récupérer les données envoyées
    $data = json_decode(file_get_contents("php://input"), true);

    // ✅ Validation des champs obligatoires
    if (
        empty($data['T1_CodeEntreprise']) ||
        empty($data['T1_NomEntreprise']) ||
        empty($data['T1_Adresse']) ||
        empty($data['T1_NomCommune'])
    ) {
        jsonResponse(["error" => "Veuillez remplir tous les champs obligatoires."], 400);
    }

    try {
        // ✅ Vérifier si le code entreprise existe déjà
        $stmt = $pdo->prepare("SELECT 1 FROM t1_entreprise WHERE T1_CodeEntreprise = ?");
        $stmt->execute([$data['T1_CodeEntreprise']]);
        if ($stmt->fetch()) {
            jsonResponse(["error" => "Ce code entreprise existe déjà."], 409);
        }

        // ✅ Préparer et exécuter l'insertion
        $stmt = $pdo->prepare("
            INSERT INTO t1_entreprise 
            (T1_CodeEntreprise, T1_NomEntreprise, T1_Adresse, T1_NomCommune, T1_NomRespo, T1_NumTel) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['T1_CodeEntreprise'],
            $data['T1_NomEntreprise'],
            $data['T1_Adresse'],
            $data['T1_NomCommune'],
            $data['T1_NomRespo'] ?? null,
            $data['T1_NumTel'] ?? null
        ]);

        jsonResponse(["message" => "Entreprise enregistrée avec succès."]);
    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur serveur : " . $e->getMessage()], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ============= RÉCUPÉRATION DES ENTREPRISES =============
    
    // ✅ Tous les utilisateurs connectés peuvent voir les entreprises
    try {
        if (isset($_GET['code'])) {
            // Récupérer une entreprise spécifique
            $stmt = $pdo->prepare("SELECT * FROM t1_entreprise WHERE T1_CodeEntreprise = ?");
            $stmt->execute([$_GET['code']]);
            $entreprise = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonResponse(["data" => $entreprise]);
        } else {
            // Récupérer toutes les entreprises
            $stmt = $pdo->prepare("SELECT * FROM t1_entreprise ORDER BY T1_CodeEntreprise ASC");
            $stmt->execute();
            $entreprises = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonResponse(["data" => $entreprises]);
        }
    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur serveur: " . $e->getMessage()], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // ============= MISE À JOUR D'ENTREPRISE =============

    // Vérification des permissions
    if (!in_array($role, ['super_admin', 'admin'])) {
        jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['T1_CodeEntreprise'])) {
        jsonResponse(["error" => "Code entreprise manquant"], 400);
    }

    try {
        $sql = "UPDATE t1_entreprise SET 
                T1_NomEntreprise = ?,
                T1_Adresse = ?,
                T1_NomCommune = ?,
                T1_NomRespo = ?,
                T1_NumTel = ?
                WHERE T1_CodeEntreprise = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['T1_NomEntreprise'],
            $data['T1_Adresse'],
            $data['T1_NomCommune'],
            $data['T1_NomRespo'] ?? null,
            $data['T1_NumTel'] ?? null,
            $data['T1_CodeEntreprise']
        ]);

        if ($stmt->rowCount() > 0) {
            jsonResponse(["message" => "Entreprise mise à jour avec succès"]);
        } else {
            jsonResponse(["error" => "Aucune modification effectuée"], 404);
        }
    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur lors de la mise à jour: " . $e->getMessage()], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // ============= SUPPRESSION D'ENTREPRISE =============

    // Vérification des permissions
    if (!in_array($role, ['super_admin', 'admin'])) {
        jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
    }

    $code = $_GET['code'] ?? null;
    if (!$code) {
        jsonResponse(["error" => "Code entreprise manquant"], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM t1_entreprise WHERE T1_CodeEntreprise = ?");
        $stmt->execute([$code]);

        if ($stmt->rowCount() > 0) {
            jsonResponse(["message" => "Entreprise supprimée avec succès"]);
        } else {
            jsonResponse(["error" => "Entreprise non trouvée"], 404);
        }
    } catch (Exception $e) {
        jsonResponse(["error" => "Erreur lors de la suppression: " . $e->getMessage()], 500);
    }
} else {
    // ✅ Méthode non supportée
    jsonResponse(["error" => "Méthode non autorisée"], 405);
}
?>