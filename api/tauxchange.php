<?php
include "../config.php";
header("Content-Type: application/json");

// Récupérer le taux actuel
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT devise, taux FROM taux_change ORDER BY date_effective DESC LIMIT 1");
    $taux = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($taux);
}

// Mettre à jour le taux de change
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['devise']) && isset($data['taux'])) {
        $stmt = $pdo->prepare("INSERT INTO taux_change (devise, taux, date_effective) VALUES (?, ?, NOW())");
        $stmt->execute([$data['devise'], $data['taux']]);
        echo json_encode(["message" => "Taux mis à jour"]);
    } else {
        echo json_encode(["error" => "Données incomplètes"]);
    }
}
?>
