<?php
include "../config.php";
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

try {
    $pdo = new PDO("mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stats = [];
    $role = $_SESSION['role'] ?? '';

    switch($role) {
        case 'super_admin':
        case 'admin':
            // Statistiques administrateur
            $stmt = $pdo->query("SELECT COUNT(*) FROM t4_comptable");
            $stats['totalComptables'] = $stmt->fetchColumn();
            
            $stmt = $pdo->query("SELECT COUNT(*) FROM entreprises");
            $stats['totalEntreprises'] = $stmt->fetchColumn();
            break;

        case 'comptable_banque':
        case 'comptable_caisse':
        case 'comptable_od':
            // Statistiques comptable
            $today = date('Y-m-d');
            $firstDayOfMonth = date('Y-m-01');
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE date = ? AND user_id = ?");
            $stmt->execute([$today, $_SESSION['user_id']]);
            $stats['operationsJour'] = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE date >= ? AND user_id = ?");
            $stmt->execute([$firstDayOfMonth, $_SESSION['user_id']]);
            $stats['operationsMois'] = $stmt->fetchColumn();
            break;

        case 'chef_comptable':
            // Statistiques chef comptable
            $stmt = $pdo->query("SELECT COUNT(*) FROM operations WHERE type = 'banque'");
            $stats['opBanque'] = $stmt->fetchColumn();
            
            $stmt = $pdo->query("SELECT COUNT(*) FROM operations WHERE type = 'caisse'");
            $stats['opCaisse'] = $stmt->fetchColumn();
            
            $stmt = $pdo->query("SELECT COUNT(*) FROM operations WHERE type = 'diverses'");
            $stats['opDiverses'] = $stmt->fetchColumn();
            break;
    }

    echo json_encode(['success' => true, 'stats' => $stats]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}