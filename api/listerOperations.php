<?php
require_once "../config.php";
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');

// Fonction de test de connexion DB
function testConnection($pdo) {
    try {
        $pdo->query('SELECT 1');
        return true;
    } catch (PDOException $e) {
        error_log("Erreur connexion DB : " . $e->getMessage());
        return false;
    }
}

try {
    // Vérification de session
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Session non valide'
        ]);
        exit;
    }

    // Vérification de la base de données
    if (!isset($pdo) || !testConnection($pdo)) {
        throw new Exception('Erreur de connexion à la base de données');
    }

    // Requête SQL
    $sql = "SELECT 
                em.numPiece,
                em.datePiece,
                em.dateOperation,
                em.nomDocument,
                em.numDoc,
                em.typeDocument,
                em.exercice,
                em.devise,
                em.beneficiaire,
                em.debiteur,
                em.motif,
                cm.code_anal,
                cm.imputation,
                cm.numero_compte,
                cm.libelleOperation,
                cm.Montant,
                cm.CompteDebit,
                cm.CompteCredit
            FROM t7_entetemouv em
            LEFT JOIN t8_corpmouv cm ON em.numPiece = cm.T7_NumMouv
            ORDER BY em.datePiece DESC, cm.T8_NumeroLigneOperation ASC";

    $stmt = $pdo->prepare($sql);
    if (!$stmt->execute()) {
        throw new Exception("Erreur requête SQL : " . implode(', ', $stmt->errorInfo()));
    }

    $operations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($operations === false) {
        throw new Exception('Erreur récupération données');
    }

    // Formatage des résultats
    $formattedOperations = array_map(function($op) {
        return [
            'numPiece' => $op['numPiece'] ?? '',
            'datePiece' => $op['datePiece'] ? date('d/m/Y', strtotime($op['datePiece'])) : '',
            'dateOperation' => $op['dateOperation'] ? date('d/m/Y', strtotime($op['dateOperation'])) : '',
            'nomDocument' => $op['nomDocument'] ?? '',
            'numDoc' => $op['numDoc'] ?? '',
            'typeDocument' => $op['typeDocument'] ?? '',
            'exercice' => $op['exercice'] ?? '',
            'devise' => $op['devise'] ?? '',
            'beneficiaire' => $op['beneficiaire'] ?? '',
            'debiteur' => $op['debiteur'] ?? '',
            'motif' => $op['motif'] ?? '',
            'code_anal' => $op['code_anal'] ?? '',
            'imputation' => $op['imputation'] ?? '',
            'numero_compte' => $op['numero_compte'] ?? '',
            'libelleOperation' => $op['libelleOperation'] ?? '',
            'MontantDebit' => $op['imputation'] === 'DEBIT' ? floatval($op['Montant']) : 0,
            'MontantCredit' => $op['imputation'] === 'CREDIT' ? floatval($op['Montant']) : 0,
            'CompteDebit' => $op['CompteDebit'] ?? '',
            'CompteCredit' => $op['CompteCredit'] ?? ''
        ];
    }, $operations);

    echo json_encode($formattedOperations);

} catch (Exception $e) {
    error_log("Erreur dans listerOperations.php : " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}
?>
