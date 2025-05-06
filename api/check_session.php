<?php
session_start();
header("Content-Type: application/json");

// Rôles valides attendus
$roles_valides = [
    "super_admin",
    "admin",
    "chef_comptable",
    "comptable_caisse",
    "comptable_banque",
    "comptable_od"
];

// Vérifier si l'utilisateur est connecté et a un rôle valide
if (
    !isset($_SESSION['user_id'], $_SESSION['role']) ||
    !in_array($_SESSION['role'], $roles_valides)
) {
    echo json_encode([
        "connected" => false,
        "error" => "Utilisateur non connecté ou rôle invalide"
    ]);
    exit;
}

// Si tout est OK, retourner les infos utiles
echo json_encode([
    "connected" => true,
    "user_id" => $_SESSION['user_id'],
    "nom" => $_SESSION['nom'] ?? '',
    "email" => $_SESSION['email'] ?? '',
    "role" => $_SESSION['role']
]);
exit;
?>
