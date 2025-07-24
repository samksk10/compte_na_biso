<?php
header('Content-Type: application/json');
require_once '../config.php';

// Vérifier l'authentification
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé']);
    exit;
}

// Connexion à la base de données
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $role = $_SESSION['role'] ?? '';
        $stats = [];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
    exit;
}

// GET - Récupérer les taux de change
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Filtre par période
    if (isset($_GET['dateDebut']) && isset($_GET['dateFin'])) {
        $stmt = $pdo->prepare("SELECT * FROM taux_change WHERE date_effective BETWEEN ? AND ? ORDER BY date_effective DESC, created_at DESC");
        $stmt->execute([$_GET['dateDebut'], $_GET['dateFin']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    // Graphique USD → CDF (tous les taux dans l'ordre croissant de date)
    if (
        isset($_GET['devise_source']) && isset($_GET['devise_cible']) &&
        $_GET['devise_source'] === 'USD' && $_GET['devise_cible'] === 'CDF'
    ) {
        $stmt = $pdo->prepare("SELECT date_effective, TauxChange FROM taux_change WHERE devise_source = 'USD' AND devise_cible = 'CDF' ORDER BY date_effective ASC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    // Taux actuel
    if (isset($_GET['actuel']) && isset($_GET['devise_source']) && isset($_GET['devise_cible'])) {
        $stmt = $pdo->prepare("SELECT * FROM taux_change WHERE devise_source = ? AND devise_cible = ? AND date_effective <= CURDATE() ORDER BY date_effective DESC, created_at DESC LIMIT 1");
        $stmt->execute([$_GET['devise_source'], $_GET['devise_cible']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        exit;
    }
    if (isset($_GET['id'])) {
        // Récupérer un taux spécifique
        $stmt = $pdo->prepare("SELECT * FROM taux_change WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        // Récupérer tous les taux
        $stmt = $pdo->query("
            SELECT * FROM taux_change 
            ORDER BY date_effective DESC, created_at DESC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// POST - Créer un nouveau taux
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Insertion
        $stmt = $pdo->prepare("
            INSERT INTO taux_change (
                devise_source, devise_cible, TauxChange, date_effective, created_at
            ) VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['devise_source'],
            $data['devise_cible'],
            $data['TauxChange'],
            $data['date_effective']
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT - Modifier un taux existant
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Modification
        $stmt = $pdo->prepare("
            UPDATE taux_change 
            SET devise_source = ?,
                devise_cible = ?,
                TauxChange = ?,
                date_effective = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['devise_source'],
            $data['devise_cible'],
            $data['TauxChange'],
            $data['date_effective'],
            $data['id']
        ]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// DELETE - Supprimer un taux
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM taux_change WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
