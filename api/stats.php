<?php
include "../config.php";
header("Content-Type: application/json");

// Récupérer le total des débits et crédits
$stmt = $pdo->query("
    SELECT 
        SUM(T8_DMontant) AS total_debit,
        SUM(T8_CMontant) AS total_credit 
    FROM t8_corpmouv
");
$stats = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($stats);
?>
