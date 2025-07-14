document.addEventListener('DOMContentLoaded', () => {
    const tauxChangeForm = document.getElementById('tauxChangeForm');
    const tauxChangeTable = document.getElementById('tauxChangeTable');
    let editMode = false;
    let editId = null;

    // Fonction pour charger les taux de change
    async function loadTauxChange() {
        toggleSpinner(true);
        try {
            const response = await fetch('api/tauxChange.php');
            const data = await response.json();

            if (!data.length) {
                tauxChangeTable.innerHTML = '<tr><td colspan="6" class="text-center">Aucun taux de change enregistré</td></tr>';
                return;
            }

            tauxChangeTable.innerHTML = data.map(taux => `
                <tr>
                    <td>${ taux.devise_source }</td>
                    <td>${ taux.devise_cible }</td>
                    <td class="text-end">${ formatTaux(taux.TauxChange) }</td>
                    <td>${ formatDate(taux.date_effective) }</td>
                    <td>${ formatDateTime(taux.created_at) }</td>
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
        } finally {
            toggleSpinner(false);
        }
    }

    // Formater la date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    }

    // Formater la date et l'heure
    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR');
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
        toggleSpinner(true);

        const formData = {
            devise_source: document.getElementById('devise_source').value,
            devise_cible: document.getElementById('devise_cible').value,
            TauxChange: document.getElementById('TauxChange').value,
            date_effective: document.getElementById('date_effective').value
        };

        let fetchOptions = {
            headers: { 'Content-Type': 'application/json' }
        };

        if (editMode) {
            fetchOptions.method = 'PUT';
            fetchOptions.body = JSON.stringify({ id: editId, ...formData });
        } else {
            fetchOptions.method = 'POST';
            fetchOptions.body = JSON.stringify(formData);
        }

        try {
            const response = await fetch('api/tauxChange.php', fetchOptions);
            const result = await response.json();

            if (!response.ok) {
                console.error(result);
                throw new Error(result.error || 'Erreur serveur');
            }

            tauxChangeForm.reset();
            editMode = false;
            editId = null;
            await loadTauxChange();

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'enregistrement');
        } finally {
            toggleSpinner(false);
        }
    });

    // Modifier un taux
    window.editTaux = async (id) => {
        try {
            const response = await fetch(`api/tauxChange.php?id=${ id }`);
            const taux = await response.json();

            document.getElementById('devise_source').value = taux.devise_source;
            document.getElementById('devise_cible').value = taux.devise_cible;
            document.getElementById('TauxChange').value = taux.TauxChange;
            document.getElementById('date_effective').value = taux.date_effective;
            document.getElementById('created_at').value = taux.created_at;

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

    // Export Excel
    document.getElementById('exportExcel').addEventListener('click', async () => {
        toggleSpinner(true);
        try {
            const response = await fetch('api/exportTauxChange.php?format=excel');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TauxChange_${ new Date().toISOString().split('T')[ 0 ] }.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export Excel:', error);
            alert('Erreur lors de l\'export Excel');
        } finally {
            toggleSpinner(false);
        }
    });

    // Export PDF
    document.getElementById('exportPdf').addEventListener('click', async () => {
        toggleSpinner(true);
        try {
            const response = await fetch('api/exportTauxChange.php?format=pdf');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TauxChange_${ new Date().toISOString().split('T')[ 0 ] }.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export PDF:', error);
            alert('Erreur lors de l\'export PDF');
        } finally {
            toggleSpinner(false);
        }
    });

    // Chargement initial
    loadTauxChange();

    // Initialiser les champs date par défaut
    document.getElementById('date_effective').value = new Date().toISOString().slice(0, 10);
    document.getElementById('created_at').value = new Date().toISOString().slice(0, 16);
});