<?php
// enregistrerBanque.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Connexion à la base de données
$pdo = new PDO("mysql:host=localhost;dbname=cicaf_sass;charset=utf8", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Récupération des données JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['entete']) || !isset($data['lignes']) || !is_array($data['lignes'])) {
    echo json_encode([ "success" => false, "message" => "Données invalides." ]);
    exit;
}

try {
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

    // 1. Insérer dans t7_entetemouv
    $entete = $data['entete'];
    $stmtEntete = $pdo->prepare("
        INSERT INTO t7_entetemouv (
            T7_NumMouv, DateSaisie, DateOperation, T3_CodeJournal, 
            T7_TypeDoc, T7_NomDOC, T7_NumDoc, CodeComptable, 
            T7_Exercice, TauxChange, NomBeneficiaire, NomDebiteur, 
            MotifGeneral, Devise
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmtEntete->execute([
        $entete['numMouv'] ?? null,
        $entete['dateSaisie'] ?? null,
        $entete['dateOperation'] ?? null,
        $entete['codeJournal'] ?? null,
        $entete['typeDoc'] ?? null,
        $entete['nomDoc'] ?? null,
        $entete['numDoc'] ?? null,
        $entete['codeComptable'] ?? null,
        $entete['exercice'] ?? null,
        $entete['tauxChange'] ?? null,
        $entete['nomBeneficiaire'] ?? null,
        $entete['nomDebiteur'] ?? null,
        $entete['motifGeneral'] ?? null,
        $entete['devise'] ?? null,
    ]);

    // 2. Insérer dans t8_corpmouv
    $stmtLigne = $pdo->prepare("
        INSERT INTO t8_corpmouv (
            T8_NumeroLigneOperation, 
            T7_NumMouv, 
            numero_compte,
            T6_CodeAnal, 
            Imputation, 
            LibelleOperation, 
            Montant,
            Solde
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($data['lignes'] as $ligne) {
        $stmtLigne->execute([
            $ligne['numeroLigneOperation'] ?? null,
            $entete['numMouv'], // FK
            $ligne['numero_compte'] ?? null,
            $ligne['codeAnal'] ?? null,
            $ligne['imputation'] ?? null,
            $ligne['libelle'] ?? null,
            $ligne['montant'] ?? null,
            $ligne['solde'] ?? null
        ]);
    }

    // Commit
    $pdo->commit();

    echo json_encode([ "success" => true ]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([ "success" => false, "message" => "Erreur : " . $e->getMessage() ]);
}
