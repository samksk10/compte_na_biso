// Vérifier si l'utilisateur est Super Admin ou Admin, sinon rediriger
const userRole = localStorage.getItem('role');
if (!userRole || (userRole.trim() !== "super_admin" && userRole.trim() !== "admin")) {
    // Afficher un message d'alerte et rediriger vers le tableau de bord
    alert("Accès refusé ! Seuls les administrateurs peuvent ajouter un comptable.");
    window.location.href = "dashboard.html";
}

// Fonction pour modifier un comptable
function editComptable(id, nom, email, role) {
    // Demander le nom, email et rôle à modifier
    let newName = prompt("Modifier le nom :", nom);
    let newEmail = prompt("Modifier l'email :", email);
    let newRole = prompt("Modifier le rôle :", role);

    // Vérifier si les valeurs sont valides
    if (!newName || !newEmail || !newRole) return; // Empêche l'envoi si annulé

    // Envoi de la requête PUT pour mettre à jour le comptable
    fetch("http://localhost/compte_na_biso/api/comptables.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            T4_NumComptable: id,
            T4_NomComptable: newName.trim(),
            T4_Email: newEmail.trim(),
            T4_Role: newRole.trim() // Ajout du rôle modifié
        }),
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || "Erreur inconnue"); });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            loadComptables();  // Recharge la liste des comptables après modification
        })
        .catch(error => console.error("Erreur :", error));
}
// Fonction pour supprimer un comptable
function deleteComptable(id) {
    if (confirm("Voulez-vous vraiment supprimer ce comptable ?")) {
        // Envoi de la requête DELETE pour supprimer le comptable
        fetch("http://localhost/compte_na_biso/api/comptables.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ T4_NumComptable: id }),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || "Erreur inconnue"); });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                loadComptables();  // Recharge la liste des comptables après suppression
            })
            .catch(error => console.error("Erreur :", error));
    }
}
