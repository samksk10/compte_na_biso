<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $role = $_SESSION['role'] ?? '';
    $stats = [];

    // Stats selon le rôle
    switch($role) {
        case 'super_admin':
            $stats['totalUsers'] = getCount($pdo, "SELECT COUNT(*) FROM users");
            $stats['totalAdmins'] = getCount($pdo, "SELECT COUNT(*) FROM users WHERE role = 'admin'");
            $stats['totalComptables'] = getCount($pdo, "SELECT COUNT(*) FROM t4_comptable");
            $stats['totalEntreprises'] = getCount($pdo, "SELECT COUNT(*) FROM entreprises");
            $stats['recentActivity'] = getRecentActivity($pdo);
            break;

        case 'admin':
            $stats['totalComptables'] = getCount($pdo, "SELECT COUNT(*) FROM t4_comptable");
            $stats['totalEntreprises'] = getCount($pdo, "SELECT COUNT(*) FROM entreprises");
            $stats['activitesToday'] = getCount($pdo, "SELECT COUNT(*) FROM operations WHERE DATE(date_creation) = CURDATE()");
            break;

        case 'chef_comptable':
            $stats['opBanque'] = getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'banque'");
            $stats['opCaisse'] = getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'caisse'");
            $stats['opDiverses'] = getCount($pdo, "SELECT COUNT(*) FROM operations WHERE type = 'diverses'");
            break;

        default:
            $stats['operationsMois'] = getCount($pdo, "SELECT COUNT(*) FROM operations WHERE MONTH(date_creation) = MONTH(CURDATE())");
            break;
    }

    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);

} catch(Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des statistiques'
    ]);
}

function getCount($pdo, $sql) {
    return $pdo->query($sql)->fetchColumn();
}

function getRecentActivity($pdo) {
    $sql = "SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}