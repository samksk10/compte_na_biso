document.addEventListener("DOMContentLoaded", function () {
    const entrepriseForm = document.getElementById("entrepriseForm");
    const messageDiv = document.getElementById("message");
    const submitBtn = entrepriseForm.querySelector('button[type="submit"]');
    const entrepriseListDiv = document.getElementById("entrepriseList"); // Pour afficher la liste

    // Vérifier si la variable userRole est définie
    const userRole = localStorage.getItem('role');
    if (!userRole || (userRole.trim() !== "super_admin" && userRole.trim() !== "admin")) {
        alert("Accès refusé ! Seuls les administrateurs peuvent accéder à cette page.");
        window.location.href = "dashboard.html";
    }

    // Fonction pour afficher les messages
    function showMessage(message, type = 'success') {
        messageDiv.innerHTML = `
            <div class="alert alert-${ type } alert-dismissible fade show" role="alert">
                ${ message }
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // Suppression automatique après 5 secondes
        setTimeout(() => {
            const alert = messageDiv.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    }

    // Validation des données
    function validateFormData(formData) {
        // Validation du code entreprise
        if (!formData.T1_CodeEntreprise || isNaN(formData.T1_CodeEntreprise)) {
            showMessage("Le code entreprise doit être un nombre valide", "danger");
            return false;
        }

        // Validation du nom
        if (!formData.T1_NomEntreprise || formData.T1_NomEntreprise.length < 2) {
            showMessage("Le nom de l'entreprise est requis (min 2 caractères)", "danger");
            return false;
        }

        // Validation de l'adresse
        if (!formData.T1_Adresse) {
            showMessage("L'adresse est requise", "danger");
            return false;
        }

        // Validation de la commune
        if (!formData.T1_NomCommune) {
            showMessage("Le nom de la commune est requis", "danger");
            return false;
        }

        return true;
    }

    // ✅ NOUVELLE FONCTION : Charger la liste des entreprises
    async function loadEntreprises() {
        try {
            const response = await fetch("http://localhost/compte_na_biso/api/entreprise.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: "include"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erreur lors du chargement");
            }

            // Afficher les entreprises si l'élément existe
            if (entrepriseListDiv && result.data) {
                displayEntreprises(result.data);
            }

        } catch (error) {
            console.error("Erreur lors du chargement:", error);
            if (entrepriseListDiv) {
                entrepriseListDiv.innerHTML = `
                    <div class="alert alert-warning">
                        Erreur lors du chargement des entreprises : ${ error.message }
                    </div>
                `;
            }
        }
    }

    // ✅ NOUVELLE FONCTION : Afficher la liste des entreprises
    function displayEntreprises(entreprises) {
        if (!entrepriseListDiv) return;

        if (entreprises.length === 0) {
            entrepriseListDiv.innerHTML = `
                <div class="alert alert-info">
                    Aucune entreprise enregistrée pour le moment.
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Code</th>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Commune</th>
                            <th>Responsable</th>
                            <th>Téléphone</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        entreprises.forEach(entreprise => {
            html += `
                <tr>
                    <td>${ entreprise.T1_CodeEntreprise }</td>
                    <td>${ entreprise.T1_NomEntreprise }</td>
                    <td>${ entreprise.T1_Adresse }</td>
                    <td>${ entreprise.T1_NomCommune }</td>
                    <td>${ entreprise.T1_NomRespo || '-' }</td>
                    <td>${ entreprise.T1_NumTel || '-' }</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        entrepriseListDiv.innerHTML = html;
    }

    // ✅ GESTION DU FORMULAIRE (création d'entreprise)
    entrepriseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Désactiver le bouton pendant l'envoi
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Enregistrement...
        `;

        const formData = {
            T1_CodeEntreprise: document.getElementById("T1_CodeEntreprise").value.trim(),
            T1_NomEntreprise: document.getElementById("T1_NomEntreprise").value.trim(),
            T1_Adresse: document.getElementById("T1_Adresse").value.trim(),
            T1_NomCommune: document.getElementById("T1_NomCommune").value.trim(),
            T1_NomRespo: document.getElementById("T1_NomRespo").value.trim(),
            T1_NumTel: document.getElementById("T1_NumTel").value.trim()
        };

        // Validation avant envoi
        if (!validateFormData(formData)) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-save"></i> Enregistrer`;
            return;
        }

        try {
            const response = await fetch("http://localhost/compte_na_biso/api/entreprise.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: "include",
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de l'enregistrement");
            }

            showMessage(data.message || "Entreprise enregistrée avec succès");
            entrepriseForm.reset();

            // ✅ Recharger la liste après ajout
            loadEntreprises();

        } catch (error) {
            console.error("Erreur:", error);
            showMessage(error.message || "Une erreur s'est produite", "danger");

        } finally {
            // Réactiver le bouton dans tous les cas
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-save"></i> Enregistrer`;
        }
    });

    // Validation en temps réel pour le téléphone
    document.getElementById("T1_NumTel").addEventListener("input", function (e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });

    // ✅ Charger les entreprises au démarrage
    loadEntreprises();
});