// Fonction pour échapper les caractères HTML dangereux
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

    // ✅ Fonction accessible globalement
    function loadComptables(search = "") {
        let url = "http://localhost/compte_na_biso/api/comptables.php";
        if (search) url += "?search=" + encodeURIComponent(search);

        fetch(url, { credentials: "include" })
            .then(response => response.json())
            .then(data => {
                if (!tableBody) return; // 🔹 Vérifie si la table existe avant de l'utiliser

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
                                data-email="${ comptable.T4_Email }" data-role="${ comptable.T4_Role }"> <!-- Ajout du rôle -->
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

                document.querySelectorAll(".edit-btn").forEach(btn => {
                    btn.addEventListener("click", function () {
                        editComptable(this.dataset.id, this.dataset.nom, this.dataset.email);
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

    // ✅ Exécuter uniquement si le formulaire existe
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const codeComptable = document.getElementById("codeComptable");
            const motDePasse = document.getElementById("motDePasse");
            const dateDebut = document.getElementById("dateDebut");
            const nomComptable = document.getElementById("nomComptable");
            const emailComptable = document.getElementById("emailComptable");
            const userRole = document.getElementById("userRole");

            if (!codeComptable.value.trim() || !motDePasse.value.trim() || !dateDebut.value.trim() ||
                !nomComptable.value.trim() || !emailComptable.value.trim() || !userRole.value) {
                alert("Erreur : Veuillez remplir tous les champs du formulaire.");
                return;
            }

            const formData = {
                T4_CodeComptable: codeComptable.value.trim(),
                T4_MotDePasseCompta: motDePasse.value.trim(),
                T4_DateDebutComptable: dateDebut.value.trim(),
                T4_NomComptable: nomComptable.value.trim(),
                T4_Email: emailComptable.value.trim(),
                T4_Role: userRole.value
            };

            fetch("http://localhost/compte_na_biso/api/comptables.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include"
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.error || "Erreur inconnue"); });
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("message").innerHTML =
                        `<div class="alert alert-success">${ data.message }</div>`;
                    form.reset();
                    loadComptables();
                })
                .catch(error => {
                    document.getElementById("message").innerHTML =
                        `<div class="alert alert-danger">${ error.message }</div>`;
                });
        });
    } else {
        console.warn("⚠️ Aucun formulaire trouvé. Cette page est probablement seulement pour afficher les comptables.");
    }

    // ✅ Exécuter uniquement si la table existe
    if (tableBody) {
        loadComptables();
    } else {
        console.warn("⚠️ Aucun tableau trouvé. Cette page ne nécessite pas de chargement des comptables.");
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

    setupLogoutButton();
});
