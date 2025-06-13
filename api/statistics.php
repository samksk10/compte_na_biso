<?php
include "../config.php";
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $role = $_SESSION['role'] ?? '';
    $response = [];

    // Stats selon le rôle
    switch($role) {
        case 'super_admin':
            $response['super_admin'] = [
                'totalAdministrateurs' => getCount($pdo, "SELECT COUNT(*) FROM users WHERE role = 'admin'"),
            ];
            // Ajouter les stats du chef comptable pour super_admin
            $response['chefComptable'] = [
                'opBanque' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('EB', 'SB')"),
                'opCaisse' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('RC', 'SC')"),
                'opDiverses' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('OD', 'JD')"),
                'comptesAnalytiques' => getCount($pdo, "SELECT COUNT(*) FROM comptes_analytiques")
            ];
            // no break intentionally

        case 'admin':
            $response['admin'] = [
                'totalComptables' => getCount($pdo, "SELECT COUNT(*) FROM t4_comptable"),
                'totalEntreprises' => getCount($pdo, "SELECT COUNT(*) FROM t1_entreprise"),
                'totalChefsComptables' => getCount($pdo, "SELECT COUNT(*) FROM users WHERE role = 'chef_comptable'")
            ];
            // Ajouter les stats du chef comptable pour admin si pas déjà définies
            if (!isset($response['chefComptable'])) {
                $response['chefComptable'] = [
                    'opBanque' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                                  INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                                  WHERE em.typeDocument IN ('EB', 'SB')"),
                    'opCaisse' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                                  INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                                  WHERE em.typeDocument IN ('RC', 'SC')"),
                    'opDiverses' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                                  INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                                  WHERE em.typeDocument IN ('OD', 'JD')"),
                    'comptesAnalytiques' => getCount($pdo, "SELECT COUNT(*) FROM comptes_analytiques")
                ];
            }
            break;

        case 'chef_comptable':
            $response['chefComptable'] = [
                // Ajouter le GROUP BY pour éviter les doublons
                'opBanque' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('EB', 'SB')"),
                'opCaisse' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('RC', 'SC')"),
                'opDiverses' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                              INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                              WHERE em.typeDocument IN ('OD', 'JD')"),
                'comptesAnalytiques' => getCount($pdo, "SELECT COUNT(*) FROM comptes_analytiques")
            ];
            break;

        default:
            $response['comptable'] = [
                'operationsJour' => getCount($pdo, "SELECT COUNT(*) FROM t8_corpmouv cm 
                                   INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                                   WHERE DATE(em.datePiece) = CURDATE()"),
                'operationsMois' => getCount($pdo, "SELECT COUNT(*) FROM t8_corpmouv cm 
                                   INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                                   WHERE MONTH(em.datePiece) = MONTH(CURDATE()) 
                                   AND YEAR(em.datePiece) = YEAR(CURDATE())"),
                'totalOperations' => getCount($pdo, "SELECT COUNT(*) FROM t8_corpmouv cm 
                                   INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece")
            ];
            break;
    }

    echo json_encode($response);

} catch(Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur lors de la récupération des statistiques'
    ]);
}

function getCount($pdo, $query) {
    $stmt = $pdo->query($query);
    return $stmt->fetchColumn();
}

function getRecentActivity($pdo, $limit = 5) {
    $stmt = $pdo->prepare("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?");
    $stmt->execute([$limit]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}