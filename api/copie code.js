// Rendre les fonctions accessibles globalement
function editComptable(id, nom, email, role) {
    let newName = prompt("Modifier le nom :", nom);
    let newEmail = prompt("Modifier l'email :", email);
    let newRole = prompt("Modifier le rôle :", role);

    if (!newName || !newEmail || !newRole) return; // Empêche l'envoi si annulé

    fetch("http://localhost/compte_na_biso/api/comptables.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            T4_NumComptable: id,
            T4_NomComptable: newName.trim(),
            T4_Email: newEmail.trim(),
            T4_Role: newRole.trim()
        })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadComptables();
        })
        .catch(error => console.error("Erreur :", error));
}

function deleteComptable(id) {
    if (confirm("Voulez-vous vraiment supprimer ce comptable ?")) {
        fetch("http://localhost/compte_na_biso/api/comptables.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", T4_NumComptable: id })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadComptables();
            })
            .catch(error => console.error("Erreur :", error));
    }
}

// Fonction utilitaire pour échapper les caractères HTML dangereux
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("comptablesList");
    const form = document.getElementById("comptableForm");
    const searchInput = document.getElementById("searchComptable");

    // Vérification des éléments pour éviter les erreurs
    if (!tableBody || !form) {
        console.error("Erreur : Impossible de trouver la table ou le formulaire.");
        return;
    }

    // Soumission du formulaire d'ajout
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const codeComptable = document.getElementById("codeComptable");
        const motDePasse = document.getElementById("motDePasse");
        const dateDebut = document.getElementById("dateDebut");
        const nomComptable = document.getElementById("nomComptable");
        const emailComptable = document.getElementById("emailComptable");
        const userRole = document.getElementById("userRole");

        // Vérification que tous les champs sont remplis
        if (!codeComptable || !motDePasse || !dateDebut || !nomComptable || !emailComptable || !userRole) {
            alert("Erreur : Veuillez remplir tous les champs du formulaire.");
            return;
        }

        const formData = {
            T4_CodeComptable: codeComptable.value,
            T4_MotDePasseCompta: motDePasse.value,
            T4_DateDebutComptable: dateDebut.value,
            T4_NomComptable: nomComptable.value,
            T4_Email: emailComptable.value,
            T4_Role: userRole.value
        };

        fetch("http://localhost/compte_na_biso/api/comptables.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    document.getElementById("message").innerHTML =
                        `<div class="alert alert-success">${ data.message }</div>`;
                    form.reset();
                    loadComptables();
                } else {
                    document.getElementById("message").innerHTML =
                        `<div class="alert alert-danger">${ data.error }</div>`;
                }
            })
            .catch(error => console.error("Erreur :", error));
    });

    // Chargement de la liste des comptables
    function loadComptables(search = "") {
        let url = "http://localhost/compte_na_biso/api/comptables.php";
        if (search) url += "?search=" + encodeURIComponent(search);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                tableBody.innerHTML = "";
                data.forEach(comptable => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${ comptable.T4_NumComptable }</td>
                        <td>${ escapeHTML(comptable.T4_CodeComptable) }</td>
                        <td>${ escapeHTML(comptable.T4_NomComptable) }</td>
                        <td>${ escapeHTML(comptable.T4_Email) }</td>
                        <td>${ comptable.T4_DateDebutComptable || 'Non renseigné' }</td>
                        <td>${ comptable.T4_Role || 'Non défini' }</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" 
                                data-id="${ comptable.T4_NumComptable }" 
                                data-nom="${ comptable.T4_NomComptable }" 
                                data-email="${ comptable.T4_Email }" 
                                data-role="${ comptable.T4_Role }">
                                Modifier
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" 
                                data-id="${ comptable.T4_NumComptable }">
                                Supprimer
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Ajouter les events listeners pour les boutons Modifier/Supprimer
                document.querySelectorAll(".edit-btn").forEach(btn => {
                    btn.addEventListener("click", function () {
                        editComptable(this.dataset.id, this.dataset.nom, this.dataset.email, this.dataset.role);
                    });
                });

                document.querySelectorAll(".delete-btn").forEach(btn => {
                    btn.addEventListener("click", function () {
                        deleteComptable(this.dataset.id);
                    });
                });
            })
            .catch(error => console.error("Erreur :", error));
    }

    // Gestion de la déconnexion
    function setupLogoutButton() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (event) {
                event.preventDefault();
                localStorage.clear();
                window.location.href = "index.html";
            });
        }
    }

    loadComptables();
    setupLogoutButton();
});
