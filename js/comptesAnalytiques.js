document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('analytiqueForm');

    if (!form) {
        console.error('Formulaire non trouvé');
        return;
    }

    // Définir la date du jour par défaut
    const dateInput = document.getElementById('T6_DateAnal');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Gestionnaire de soumission du formulaire
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Afficher un indicateur de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi...';
        submitBtn.disabled = true;

        try {
            // Récupérer les données du formulaire
            const analytiqueForm = {
                T6_NumAnal: document.getElementById('T6_NumAnal').value.trim(),
                T6_CodeAnal: document.getElementById('T6_CodeAnal').value.trim(),
                T6_DesiAnal: document.getElementById('T6_DesiAnal').value.trim(),
                T6_DateAnal: document.getElementById('T6_DateAnal').value
            };

            // Validation côté client
            if (!analytiqueForm.T6_NumAnal || !analytiqueForm.T6_CodeAnal || !analytiqueForm.T6_DesiAnal || !analytiqueForm.T6_DateAnal) {
                throw new Error('Tous les champs sont obligatoires');
            }

            const response = await fetch("http://localhost/compte_na_biso/api/comptesAnalytiques.php", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(analytiqueForm),
                credentials: 'include' // Ajouter cette ligne pour envoyer les cookies de session
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success) {
                    showMessage('Compte analytique créé avec succès', 'success');
                    form.reset();
                    if (dateInput) {
                        dateInput.valueAsDate = new Date();
                    }
                } else {
                    showMessage(data.error || 'Une erreur est survenue', 'danger');
                }
            } else {
                showMessage(data.error || `Erreur HTTP: ${ response.status }`, 'danger');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(`Erreur: ${ error.message }`, 'danger');
        } finally {
            // Restaurer le bouton
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Validation du code analytique en temps réel
    const codeInput = document.getElementById('T6_CodeAnal');
    if (codeInput) {
        codeInput.addEventListener('input', function (e) {
            this.value = this.value.toUpperCase();
        });
    }
});

// Ajouter cette fonction dans comptesAnalytiques.js
function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.className = `alert alert-${ type } message-container show`;
    messageContainer.textContent = message;

    // Faire disparaître le message après 5 secondes
    setTimeout(() => {
        messageContainer.className = `alert alert-${ type } message-container`;
    }, 5000);
}

// Fonction pour charger les comptes analytiques
async function loadComptesAnalytiques(searchTerm = '') {
    try {
        const url = searchTerm
            ? `api/comptesAnalytiques.php?search=${ encodeURIComponent(searchTerm) }`
            : 'api/comptesAnalytiques.php';

        const response = await fetch(url, {
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors du chargement des données');
        }

        const tbody = document.getElementById('comptesAnalytiquesList');
        tbody.innerHTML = '';

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Aucun compte analytique trouvé</td>
                </tr>`;
            return;
        }

        data.data.forEach(compte => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ compte.num_anal }</td>
                <td>${ compte.code_anal }</td>
                <td>${ compte.desi_anal }</td>
                <td>${ new Date(compte.date_anal).toLocaleDateString() }</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-info" title="Voir les détails" onclick="viewCompte('${ compte.code_anal }')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-warning" title="Modifier" onclick="editCompte('${ compte.code_anal }')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger" title="Supprimer" onclick="deleteCompte('${ compte.code_anal }')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

// Gestionnaires d'événements pour la recherche
document.getElementById('searchButton')?.addEventListener('click', () => {
    const searchTerm = document.getElementById('searchCompte').value;
    loadComptesAnalytiques(searchTerm);
});

document.getElementById('searchCompte')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value;
        loadComptesAnalytiques(searchTerm);
    }
});

// Fonctions pour les actions CRUD
async function viewCompte(code) {
    try {
        const response = await fetch(`api/comptesAnalytiques.php?code=${ code }`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // Afficher les détails dans un modal Bootstrap
        // TODO: Implémenter l'affichage des détails
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function editCompte(code) {
    // TODO: Implémenter la modification
    console.log('Édition du compte:', code);
}

async function deleteCompte(code) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) return;

    try {
        const response = await fetch(`api/comptesAnalytiques.php?code=${ code }`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        showMessage('Compte supprimé avec succès', 'success');
        loadComptesAnalytiques(); // Recharger la liste
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

// Charger les comptes au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadComptesAnalytiques();
});