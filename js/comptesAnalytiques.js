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