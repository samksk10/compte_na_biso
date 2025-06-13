<?php
require_once "../config.php";
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');

try {
    // Vérifier l'authentification
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Non autorisé');
    }

    // Préparer la requête SQL
    $sql = "SELECT 
                em.numPiece,
                em.datePiece,
                em.typeDocument,
                em.beneficiaire,
                em.motif,
                SUM(CASE WHEN cm.imputation = 'DEBIT' THEN cm.montant ELSE 0 END) as totalDebit,
                SUM(CASE WHEN cm.imputation = 'CREDIT' THEN cm.montant ELSE 0 END) as totalCredit
            FROM t7_entetemouv em
            LEFT JOIN t8_corpmouv cm ON em.numPiece = cm.T7_NumMouv
            GROUP BY em.numPiece, em.datePiece, em.typeDocument, em.beneficiaire, em.motif
            ORDER BY em.datePiece DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $operations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les résultats
    foreach ($operations as &$op) {
        $op['totalDebit'] = floatval($op['totalDebit']);
        $op['totalCredit'] = floatval($op['totalCredit']);
        $op['datePiece'] = date('d/m/Y', strtotime($op['datePiece']));
    }

    echo json_encode($operations);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>