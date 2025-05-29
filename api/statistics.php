<?php
include "../config.php";
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode(["error" => "Non autorisé"]);
    exit;
}

$role = $_SESSION['role'];
$response = [];

try {
    // Statistiques pour admin et super_admin
    if (in_array($role, ['admin', 'super_admin'])) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role LIKE 'comptable%'");
        $totalComptables = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $stmt = $pdo->query("SELECT COUNT(*) as total FROM t1_entreprise");
        $totalEntreprises = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $response['admin'] = [
            'totalComptables' => $totalComptables,
            'totalEntreprises' => $totalEntreprises
        ];
    }

    // Statistiques pour les comptables
    if (strpos($role, 'comptable') !== false) {
        $today = date('Y-m-d');
        $firstDayOfMonth = date('Y-m-01');

        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as today_ops,
            (SELECT COUNT(*) FROM operations WHERE DATE(date_operation) >= ?) as month_ops
            FROM operations WHERE DATE(date_operation) = ?");
        $stmt->execute([$firstDayOfMonth, $today]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $response['comptable'] = [
            'operationsJour' => $stats['today_ops'],
            'operationsMois' => $stats['month_ops']
        ];
    }

    // Statistiques pour le chef comptable
    if ($role === 'chef_comptable') {
        $stmt = $pdo->query("SELECT 
            SUM(CASE WHEN type_operation = 'banque' THEN 1 ELSE 0 END) as op_banque,
            SUM(CASE WHEN type_operation = 'caisse' THEN 1 ELSE 0 END) as op_caisse,
            SUM(CASE WHEN type_operation = 'diverse' THEN 1 ELSE 0 END) as op_diverses
            FROM operations");
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $response['chefComptable'] = [
            'opBanque' => $stats['op_banque'],
            'opCaisse' => $stats['op_caisse'],
            'opDiverses' => $stats['op_diverses']
        ];
    }

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}