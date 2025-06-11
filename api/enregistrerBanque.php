<?php
// Disable error display and enable error logging
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Set proper headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Log incoming data
    error_log("Données reçues : " . file_get_contents("php://input"));

    // Récupération des données JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Données JSON invalides: " . json_last_error_msg());
    }

    if (!isset($data['entete']) || !isset($data['lignes']) || !is_array($data['lignes'])) {
        throw new Exception("Structure de données invalide");
    }

    // Récupération de l'entête
    $entete = $data['entete'];

    // Vérifier l'équilibre débit/crédit
    $totalDebit = $totalCredit = 0;
    foreach ($data['lignes'] as $ligne) {
        if ($ligne['imputation'] === 'DEBIT') {
            $totalDebit += floatval($ligne['montant']);
        } else {
            $totalCredit += floatval($ligne['montant']);
        }
    }

    if (abs($totalDebit - $totalCredit) > 0.01) {
        throw new Exception("Le total débit doit égaler le total crédit");
    }

    // Démarrer la transaction
    $pdo->beginTransaction();

    // Validation des champs obligatoires de l'entête (sans codeComptable)
    $champsObligatoires = [
        'codeJournal' => 'Code journal',
        'typeDocument' => 'Type de document',
        'nomDocument' => 'Nom du document',
        'numDoc' => 'Numéro du document',
        'exercice' => 'Exercice',
        'motif' => 'Motif'
    ];

    $champsManquants = [];
    foreach ($champsObligatoires as $champ => $label) {
        if (empty($entete[$champ])) {
            $champsManquants[] = $label;
        }
    }

    if (!empty($champsManquants)) {
        throw new Exception("Champs obligatoires manquants : " . implode(", ", $champsManquants));
    }

    // Valeurs par défaut pour les champs optionnels
    $beneficiaire = !empty($entete['beneficiaire']) ? trim($entete['beneficiaire']) : '';
    $debiteur = !empty($entete['debiteur']) ? trim($entete['debiteur']) : '';

    // 1. Insérer dans t7_entetemouv (sans codeComptable)
    $stmtEntete = $pdo->prepare("
        INSERT INTO t7_entetemouv (
            numPiece,
            datePiece,
            dateOperation,
            codeJournal,
            typeDocument,
            nomDocument,
            numDoc,
            exercice,
            TauxChange,
            beneficiaire,
            debiteur,
            motif,
            devise
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    // Nettoyer et valider les données avant insertion
    $dateOperation = !empty($entete['dateOperation']) ? $entete['dateOperation'] : date('Y-m-d');
    $tauxChange = !empty($entete['tauxChange']) ? floatval($entete['tauxChange']) : 1.0;
    $devise = !empty($entete['devise']) ? strtoupper($entete['devise']) : 'USD';

    $stmtEntete->execute([
        trim($entete['numPiece']), // Utiliser le numéro généré côté client
        date('Y-m-d'), // datePiece (date du jour)
        $dateOperation,
        trim($entete['codeJournal']),
        trim($entete['typeDocument']),
        trim($entete['nomDocument']),
        trim($entete['numDoc']),
        $entete['exercice'],
        $tauxChange,
        $beneficiaire,
        $debiteur,
        trim($entete['motif']),
        $devise
    ]);

    $numPiece = $pdo->lastInsertId();

    // 2. Insérer dans t8_corpmouv
    $stmtLigne = $pdo->prepare("
        INSERT INTO t8_corpmouv (
            T8_NumeroLigneOperation,
            T7_NumMouv,
            code_anal,
            Imputation,
            numero_compte,
            LibelleOperation,
            Montant,
            compteDebit,
            compteCredit,
            Solde
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($data['lignes'] as $ligne) {
        // Déterminer compteDebit et compteCredit selon l'imputation
        $compteDebit = $ligne['imputation'] === 'DEBIT' ? $ligne['numero_compte'] : 0;
        $compteCredit = $ligne['imputation'] === 'CREDIT' ? $ligne['numero_compte'] : 0;
        
        $stmtLigne->execute([
            null, // auto_increment
            $numPiece,
            $ligne['code_anal'],
            $ligne['imputation'] === 'DEBIT' ? 'D' : 'C', // Convertir en char(1)
            $ligne['numero_compte'],
            $ligne['libelle_operation'],
            $ligne['montant'],
            $compteDebit,
            $compteCredit,
            $ligne['solde'] ?? 0.00
        ]);
    }

    // Commit de la transaction
    $pdo->commit();

    // Use the sendJsonResponse function for success
    sendJsonResponse([
        "success" => true,
        "numPiece" => $numPiece
    ]);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    sendJsonResponse([
        "success" => false,
        "message" => "Erreur de base de données : " . $e->getMessage()
    ], 500);
} catch (Exception $e) {
    error_log("General Error: " . $e->getMessage());
    sendJsonResponse([
        "success" => false,
        "message" => $e->getMessage()
    ], 400);
}
?>