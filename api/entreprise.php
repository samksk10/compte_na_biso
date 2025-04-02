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

// ✅ Seuls les super_admin et admin peuvent enregistrer une entreprise
$role = $_SESSION['role'];
if (!in_array($role, ['super_admin', 'admin'])) {
    jsonResponse(["error" => "Accès refusé : permissions insuffisantes"], 403);
}

// ✅ Vérifier que la requête est bien en POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(["error" => "Méthode non autorisée"], 405);
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
?>
