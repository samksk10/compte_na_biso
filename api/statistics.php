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
            $response['chefComptable'] = getChefComptableStats($pdo);
            // no break intentionally

        case 'admin':
            $response['admin'] = [
                'totalComptables' => getCount($pdo, "SELECT COUNT(*) FROM t4_comptable"),
                'totalEntreprises' => getCount($pdo, "SELECT COUNT(*) FROM t1_entreprise"),
                'totalChefsComptables' => getCount($pdo, "SELECT COUNT(*) FROM users WHERE role = 'chef_comptable'")
            ];
            // Ajouter les stats du chef comptable pour admin si pas déjà définies
            if (!isset($response['chefComptable'])) {
                $response['chefComptable'] = getChefComptableStats($pdo);
            }
            break;

        case 'chef_comptable':
            $response['chefComptable'] = getChefComptableStats($pdo);
            break;

        case 'comptable_banque':
        case 'comptable_caisse':
        case 'comptable_od':
            $response['comptable'] = [
                // Statistiques spécifiques au rôle
                'operationsJour' => getDailyOperations($pdo, $role),
                'operationsMois' => getMonthlyOperations($pdo, $role),
                
                // Statistiques détaillées pour tous les types (utiles pour le dashboard)
                'operationsJourBanque' => $role === 'comptable_banque' ? getDailyOperations($pdo, 'comptable_banque') : 0,
                'operationsMoisBanque' => $role === 'comptable_banque' ? getMonthlyOperations($pdo, 'comptable_banque') : 0,
                'operationsJourCaisse' => $role === 'comptable_caisse' ? getDailyOperations($pdo, 'comptable_caisse') : 0,
                'operationsMoisCaisse' => $role === 'comptable_caisse' ? getMonthlyOperations($pdo, 'comptable_caisse') : 0,
                'operationsJourOD' => $role === 'comptable_od' ? getDailyOperations($pdo, 'comptable_od') : 0,
                'operationsMoisOD' => $role === 'comptable_od' ? getMonthlyOperations($pdo, 'comptable_od') : 0
            ];
            break;

        default:
            http_response_code(403);
            echo json_encode(['error' => 'Rôle non autorisé']);
            exit;
    }

    echo json_encode($response);

} catch(Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur lors de la récupération des statistiques'
    ]);
}

function getChefComptableStats($pdo) {
    return [
        'opBanque' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                      INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                      WHERE em.typeDocument IN ('EB', 'SB')"),
        'opCaisse' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                      INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                      WHERE em.typeDocument IN ('EC', 'SC')"),
        'opDiverses' => getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) FROM t8_corpmouv cm 
                      INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
                      WHERE em.typeDocument IN ('OD', 'JD')"),
        'comptesAnalytiques' => getCount($pdo, "SELECT COUNT(*) FROM comptes_analytiques")
    ];
}

function getDailyOperations($pdo, $role) {
    $types = [
        'comptable_banque' => ['EB', 'SB'],
        'comptable_caisse' => ['EC', 'SC'],
        'comptable_od' => ['OD', 'JD']
    ][$role] ?? [];
    
    return getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) 
           FROM t8_corpmouv cm 
           INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
           WHERE em.typeDocument IN ('" . implode("','", $types) . "')
           AND DATE(em.datePiece) = CURDATE()");
}

function getMonthlyOperations($pdo, $role) {
    $types = [
        'comptable_banque' => ['EB', 'SB'],
        'comptable_caisse' => ['EC', 'SC'],
        'comptable_od' => ['OD', 'JD']
    ][$role] ?? [];
    
    return getCount($pdo, "SELECT COUNT(DISTINCT cm.T8_NumeroLigneOperation) 
           FROM t8_corpmouv cm 
           INNER JOIN t7_entetemouv em ON cm.T7_NumMouv = em.numPiece 
           WHERE em.typeDocument IN ('" . implode("','", $types) . "')
           AND MONTH(em.datePiece) = MONTH(CURDATE()) 
           AND YEAR(em.datePiece) = YEAR(CURDATE())");
}

function getCount($pdo, $query) {
    $stmt = $pdo->query($query);
    return (int)$stmt->fetchColumn();
}