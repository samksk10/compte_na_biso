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

        if (data.error) {
            throw new Error(data.error);
        }

        const tbody = document.getElementById('comptesAnalytiquesList');
        tbody.innerHTML = '';

        data.data.forEach(compte => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ compte.num_anal }</td>
                <td>${ compte.code_anal }</td>
                <td>${ compte.desi_anal }</td>
                <td>${ new Date(compte.date_anal).toLocaleDateString() }</td>
                <td>
                    <button class="btn btn-sm btn-info" title="Voir les détails">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

// Gestionnaire de recherche
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

// Charger les comptes au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadComptesAnalytiques();
});