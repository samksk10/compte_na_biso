// Fonction pour échapper les caractères HTML dangereux (XSS protection)
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Vérifier si la variable userRole est définie
const userRole = localStorage.getItem('role');
if (!userRole || (userRole.trim() !== "super_admin" && userRole.trim() !== "admin")) {
    alert("Accès refusé ! Seuls les administrateurs peuvent accéder à cette page.");
    window.location.href = "dashboard.html";
}

// Fonction pour afficher les messages à l'utilisateur
function showMessage(type, message, elementId = 'message') {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;

    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    messageElement.innerHTML = `
        <div class="alert ${ alertClass } alert-dismissible fade show" role="alert">
            ${ escapeHTML(message) }
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Fonction principale
document.addEventListener("DOMContentLoaded", function () {
    // Constantes et variables
    const API_URL = "http://localhost/compte_na_biso/api/comptables.php";
    const tableBody = document.getElementById("comptablesList");
    const form = document.getElementById("comptableForm");
    const searchInput = document.getElementById("searchComptable");

    // 1. Fonction pour charger les comptables
    function loadComptables(search = "") {
        let url = API_URL;
        if (search) url += `?search=${ encodeURIComponent(search) }`;

        fetch(url, {
            credentials: "include",
            headers: {
                'Cache-Control': 'no-cache'
            }
        })
            .then(handleResponse)
            .then(data => {
                if (!tableBody) return;

                tableBody.innerHTML = data.map(comptable => {
                    // Échapper toutes les données avant insertion
                    const safeData = {
                        id: escapeHTML(comptable.T4_NumComptable),
                        code: escapeHTML(comptable.T4_CodeComptable),
                        nom: escapeHTML(comptable.T4_NomComptable),
                        email: escapeHTML(comptable.T4_Email),
                        date: escapeHTML(comptable.T4_DateDebutComptable || 'Non renseigné'),
                        role: escapeHTML(getRoleDisplayName(comptable.T4_Role))
                    };

                    return `
                    <tr>
                        <td>${ safeData.id }</td>
                        <td>${ safeData.code }</td>
                        <td>${ safeData.nom }</td>
                        <td>${ safeData.email }</td>
                        <td>${ safeData.date }</td>
                        <td>${ safeData.role }</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" 
                                data-id="${ safeData.id }" 
                                data-nom="${ safeData.nom }" 
                                data-email="${ safeData.email }" 
                                data-role="${ escapeHTML(comptable.T4_Role) }">
                                <i class="bi bi-pencil"></i> Modifier
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn ms-2" 
                                data-id="${ safeData.id }">
                                <i class="bi bi-trash"></i> Supprimer
                            </button>
                        </td>
                    </tr>`;
                }).join('');

                setupEventListeners();
            })
            .catch(error => {
                console.error("Erreur:", error);
                showMessage('danger', 'Erreur lors du chargement des comptables');
            });
    }

    // 2. Fonction pour gérer la réponse de l'API
    async function handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erreur HTTP: ${ response.status }`);
        }
        return data;
    }

    // 3. Fonction pour obtenir le nom affichable du rôle
    function getRoleDisplayName(role) {
        const roles = {
            'chef_comptable': 'Chef Comptable',
            'comptable_caisse': 'Comptable Caisse',
            'comptable_banque': 'Comptable Banque',
            'comptable_od': 'Comptable Opérations diverses'
        };
        return roles[ role ] || role;
    }

    // 4. Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Nettoyer les anciens événements
        document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Ajouter les nouveaux événements
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                editComptable(
                    this.dataset.id,
                    this.dataset.nom,
                    this.dataset.email,
                    this.dataset.role
                );
            });
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce comptable ?")) {
                    deleteComptable(this.dataset.id);
                }
            });
        });
    }

    // 5. Validation du formulaire
    function validateForm() {
        let isValid = true;
        const requiredFields = [
            'codeComptable', 'nomComptable', 'emailComptable',
            'motDePasse', 'dateDebut', 'userRole'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Validation spécifique de l'email
        const email = document.getElementById("emailComptable");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            email.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    // 6. Gestion de la soumission du formulaire
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            try {
                const formData = {
                    T4_CodeComptable: document.getElementById("codeComptable").value.trim(),
                    T4_NomComptable: document.getElementById("nomComptable").value.trim(),
                    T4_Email: document.getElementById("emailComptable").value.trim(),
                    T4_Role: document.getElementById("Role").value, // Changé de userRole à Role
                    T4_MotDePasseCompta: document.getElementById("motDePasse").value.trim(),
                    T4_DateDebutComptable: document.getElementById("dateDebut").value.trim()
                };

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache"
                    },
                    credentials: "include",
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.message) {
                    showMessage('success', data.message);
                    form.reset();
                    if (typeof loadComptables === 'function') {
                        loadComptables();
                    }
                } else if (data.error) {
                    throw new Error(data.error);
                }

            } catch (error) {
                console.error("Erreur:", error);
                showMessage('danger', error.message || 'Une erreur est survenue');
            }
        });
    }

    // 7. Fonctions CRUD
    async function editComptable(id, nom, email, role) {
        try {
            // Pré-remplir le formulaire
            document.getElementById('codeComptable').value = id;
            document.getElementById('nomComptable').value = nom;
            document.getElementById('emailComptable').value = email;
            document.getElementById('Role').value = role;

            // Changer le texte du bouton submit
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Modifier';

            // Changer l'action du formulaire
            form.dataset.mode = 'edit';
            form.dataset.editId = id;

            // Scroll vers le formulaire
            form.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Erreur lors de l'édition:", error);
            showMessage('danger', "Erreur lors de l'édition du comptable");
        }
    }

    async function deleteComptable(id) {
        try {
            const response = await fetch(API_URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ T4_NumComptable: id })  // Envoyer l'ID dans le body
            });

            const data = await handleResponse(response);
            if (data.message) {
                showMessage('success', data.message);
                loadComptables();
            }
        } catch (error) {
            console.error("Erreur:", error);
            showMessage('danger', error.message);
        }
    }

    // 8. Initialisation
    if (tableBody) loadComptables();
    if (searchInput) {
        searchInput.addEventListener("input", debounce(() => {
            loadComptables(searchInput.value.trim());
        }, 300));
    }

    // Fonction de debounce pour la recherche
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
});
