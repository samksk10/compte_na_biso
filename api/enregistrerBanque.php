<?php 
include '../config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$entete = $payload['entete'] ?? [];
$operations = $payload['lignes'] ?? [];

$errors = validateJournalBanque($entete, $operations);

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Données invalides',
        'errors' => $errors
    ]);
    exit;
}

$result = enregistrerMouvementBanque($entete, $operations);

if ($result) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Mouvement comptable enregistré avec succès.',
        'id' => $result
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'enregistrement du mouvement comptable.'
    ]);
}

function validateJournalBanque($entete, $operations) {
    $errors = [];

    $required_fields = [
        'numPiece' => 'Numéro de pièce',
        'datePiece' => 'Date d\'enregistrement',
        'dateOperation' => 'Date d\'opération',
        'codeJournal' => 'Code journal',
        'nomDocument' => 'Nom du document',
        'numDoc' => 'Numéro du document',
        'typeDocument' => 'Type de document',
        'codeComptable' => 'Code comptable',
        'exercice' => 'Exercice',
        'devise' => 'Devise'
    ];

    foreach ($required_fields as $field => $label) {
        if (empty($entete[$field])) {
            $errors[] = "Le champ '$label' est obligatoire.";
        }
    }

    if (!empty($entete['datePiece']) && !validateDate($entete['datePiece'])) {
        $errors[] = "Le format de la date d'enregistrement est invalide.";
    }

    if (!empty($entete['dateOperation']) && !validateDate($entete['dateOperation'])) {
        $errors[] = "Le format de la date d'opération est invalide.";
    }

    if (isset($entete['motif']) && strlen($entete['motif']) > 500) {
        $errors[] = "Le motif ne doit pas dépasser 500 caractères.";
    }

    foreach ($operations as $index => $operation) {
        if (empty($operation['CompteOperation'])) {
            $errors[] = "Le compte d'opération est obligatoire pour l'opération #" . ($index + 1);
        }

        if (empty($operation['LibelleOperation'])) {
            $errors[] = "Le libellé est obligatoire pour l'opération #" . ($index + 1);
        }

        if (empty($operation['MontantDebit']) && empty($operation['MontantCredit'])) {
            $errors[] = "Vous devez spécifier soit un montant débit soit un montant crédit pour l'opération #" . ($index + 1);
        }

        if (!empty($operation['MontantDebit']) && !is_numeric($operation['MontantDebit'])) {
            $errors[] = "Le montant débit doit être un nombre pour l'opération #" . ($index + 1);
        }

        if (!empty($operation['MontantCredit']) && !is_numeric($operation['MontantCredit'])) {
            $errors[] = "Le montant crédit doit être un nombre pour l'opération #" . ($index + 1);
        }
    }

    return $errors;
}

function validateDate($date) {
    $parts = explode('-', $date);
    if (count($parts) !== 3) return false;
    return checkdate((int)$parts[1], (int)$parts[2], (int)$parts[0]);
}

function enregistrerMouvementBanque($entete, $operations) {
    $conn = getConnection();

    if (!$conn) return false;

    try {
        $conn->begin_transaction();

        $query = "SELECT MAX(T7_NumMouv) as max_num FROM t7_entetemouv";
        $result = $conn->query($query);
        $row = $result->fetch_assoc();
        $nextNumMouv = ($row['max_num'] ?? 0) + 1;

        $exercice = $entete['exercice'];
        if (!is_numeric($exercice) || strlen($exercice) > 4) {
            $exercice = date('Y', strtotime($entete['dateOperation']));
        }

        $query = "INSERT INTO t7_entetemouv (
            T7_NumMouv, DateSaisie, DateOperation, T3_CodeJournal, T7_TypeDoc,
            T7_NomDOC, T7_NumDoc, CodeComptable, T7_Exercice,
            NomBeneficiaire, NomDebiteur, MotifGeneral, Devise
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($query);
        if (!$stmt) throw new Exception('Erreur préparation en-tête: ' . $conn->error);

        $stmt->bind_param(
            'isssssssissss',
            $nextNumMouv,
            $entete['datePiece'],
            $entete['dateOperation'],
            $entete['codeJournal'],
            $entete['typeDocument'],
            $entete['nomDocument'],
            $entete['numDoc'],
            $entete['codeComptable'],
            $exercice,
            $entete['beneficiaire'] ?? null,
            $entete['debiteur'] ?? null,
            $entete['motif'] ?? null,
            $entete['devise']
        );

        if (!$stmt->execute()) {
            throw new Exception('Erreur exécution en-tête: ' . $stmt->error);
        }
        $stmt->close();

        if (!empty($operations)) {
            $query = "SELECT MAX(T8_NumeroLigneOperation) as max_line FROM t8_corpmouv";
            $result = $conn->query($query);
            $row = $result->fetch_assoc();
            $nextLineNum = ($row['max_line'] ?? 0) + 1;

            $stmt = $conn->prepare("INSERT INTO t8_corpmouv (
                T8_NumeroLigneOperation, T7_NumMouv, numero_compte, T6_CodeAnal,
                Imputation, LibelleOperation, Montant, SousCompte,
                CompteDivisionnaire, Solde
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            if (!$stmt) throw new Exception('Erreur préparation ligne: ' . $conn->error);

            foreach ($operations as $i => $op) {
                $montant = !empty($op['MontantDebit']) ? $op['MontantDebit'] : $op['MontantCredit'];
                $imputation = !empty($op['MontantDebit']) ? 'D' : 'C';
                $solde = !empty($op['MontantDebit']) ? $montant : -$montant;
                $ligne = $nextLineNum + $i;

                $stmt->bind_param(
                    'iisssdssd',
                    $ligne,
                    $nextNumMouv,
                    $op['CompteOperation'],
                    $op['CodeAnalytique'] ?? null,
                    $imputation,
                    $op['LibelleOperation'],
                    $montant,
                    $op['SousCompte'] ?? null,
                    $op['CompteDebit'] ?? ($imputation == 'D' ? $op['CompteOperation'] : null),
                    $solde
                );

                if (!$stmt->execute()) {
                    throw new Exception('Erreur insertion ligne: ' . $stmt->error);
                }
            }

            $stmt->close();
        }

        $conn->commit();
        $conn->close();
        return $nextNumMouv;

    } catch (Exception $e) {
        $conn->rollback();
        error_log('[Journal Banque] ' . $e->getMessage());
        $conn->close();
        return false;
    }
}
