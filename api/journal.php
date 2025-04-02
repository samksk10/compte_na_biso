<?php
include "../config.php";
header("Content-Type: application/json");

// Récupérer toutes les opérations comptables
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT T8_NLgnOper, T7_NumMouv, T8_DMontant, T8_CMontant, T8_DCompte, T8_CCompte, T8_Libelle 
                         FROM t8_corpmouv ORDER BY T8_NLgnOper DESC");
    $operations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($operations);
}

// Ajouter une opération comptable
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['T8_NumMouv']) && isset($data['T8_DMontant']) && isset($data['T8_CMontant']) && 
        isset($data['T8_DCompte']) && isset($data['T8_CCompte']) && isset($data['T8_Libelle'])) {
        
        // Vérification que Débit = Crédit
        if ($data['T8_DMontant'] != $data['T8_CMontant']) {
            echo json_encode(["error" => "Le montant débité doit être égal au montant crédité"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO t8_corpmouv (T8_NumMouv, T8_DMontant, T8_CMontant, T8_DCompte, T8_CCompte, T8_Libelle) 
                               VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['T8_NumMouv'], $data['T8_DMontant'], $data['T8_CMontant'], $data['T8_DCompte'], $data['T8_CCompte'], $data['T8_Libelle']]);
        echo json_encode(["message" => "Opération enregistrée"]);
    } else {
        echo json_encode(["error" => "Données incomplètes"]);
    }
}
?>
