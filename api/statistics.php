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
            // Inclure aussi les stats d'admin pour super_admin
            // no break intentionally
        case 'admin':
            $response['admin'] = [
                'totalComptables' => getCount($pdo, "SELECT COUNT(*) FROM t4_comptable"),
                'totalEntreprises' => getCount($pdo, "SELECT COUNT(*) FROM t1_entreprise"),
                'totalChefsComptables' => getCount($pdo, "SELECT COUNT(*) FROM users WHERE role = 'chef_comptable'")
            ];
            break;

        case 'chef_comptable':
            $response['chefComptable'] = [
                'opBanque' => getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'banque'"),
                'opCaisse' => getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'caisse'"),
                'opDiverses' => getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'diverses'")
            ];
            break;

        default:
            $response['comptable'] = [
                'operationsJour' => getCount($pdo, "SELECT COUNT(*) FROM operations WHERE DATE(date_creation) = CURDATE()"),
                'operationsMois' => getCount($pdo, "SELECT COUNT(*) FROM operations WHERE MONTH(date_creation) = MONTH(CURDATE())")
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