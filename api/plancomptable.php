<?php
include "../config.php";
header("Content-Type: application/json");

try {
    // Récupérer tous les comptes comptables avec leurs détails
    $stmt = $pdo->query("SELECT numero_compte, code_compte, designation_compte, designation_classe, compte_principal, sous_compte, designation_sous_compte, compte_divisionnaire, designation_compte_divisionnaire 
                         FROM t5_plancomptable 
                         ORDER BY numero_compte ASC");

    $comptes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($comptes);

} catch (Exception $e) {
    echo json_encode(["error" => "Erreur lors de la récupération des comptes : " . $e->getMessage()]);
}
?>
