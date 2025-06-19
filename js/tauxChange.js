document.addEventListener('DOMContentLoaded', () => {
    const tauxChangeForm = document.getElementById('tauxChangeForm');
    const tauxChangeTable = document.getElementById('tauxChangeTable');
    let editMode = false;
    let editId = null;

    // Charger les taux de change
    async function loadTauxChange() {
        try {
            const response = await fetch('api/tauxChange.php');
            const data = await response.json();

            if (!data.length) {
                tauxChangeTable.innerHTML = '<tr><td colspan="6" class="text-center">Aucun taux de change enregistré</td></tr>';
                return;
            }

            tauxChangeTable.innerHTML = data.map(taux => `
                <tr>
                    <td>${ formatDate(taux.dateTaux) }</td>
                    <td>${ taux.devise }</td>
                    <td class="text-end">${ formatTaux(taux.taux) }</td>
                    <td>${ taux.deviseRef }</td>
                    <td>${ formatDate(taux.dateCreation) }</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editTaux(${ taux.id })">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTaux(${ taux.id })">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erreur:', error);
            tauxChangeTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Une erreur est survenue</td></tr>';
        }
    }

    // Formater la date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    }

    // Formater le taux
    function formatTaux(taux) {
        return Number(taux).toLocaleString('fr-FR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        });
    }

    // Soumettre le formulaire
    tauxChangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(tauxChangeForm);

        try {
            const response = await fetch('api/tauxChange.php', {
                method: editMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editId,
                    devise: formData.get('devise'),
                    dateTaux: formData.get('dateTaux'),
                    taux: formData.get('tauxChange'),
                    deviseRef: formData.get('deviseRef')
                })
            });

            if (!response.ok) throw new Error('Erreur serveur');

            // Réinitialiser le formulaire et recharger les données
            tauxChangeForm.reset();
            editMode = false;
            editId = null;
            await loadTauxChange();

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'enregistrement');
        }
    });

    // Modifier un taux
    window.editTaux = async (id) => {
        try {
            const response = await fetch(`api/tauxChange.php?id=${ id }`);
            const taux = await response.json();

            document.getElementById('devise').value = taux.devise;
            document.getElementById('dateTaux').value = taux.dateTaux;
            document.getElementById('tauxChange').value = taux.taux;
            document.getElementById('deviseRef').value = taux.deviseRef;

            editMode = true;
            editId = id;

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la récupération des données');
        }
    };

    // Supprimer un taux
    window.deleteTaux = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce taux de change ?')) return;

        try {
            const response = await fetch(`api/tauxChange.php?id=${ id }`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erreur serveur');

            await loadTauxChange();

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la suppression');
        }
    };

    // Chargement initial
    loadTauxChange();
});