document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById('tableOperations');
    const messageContainer = document.getElementById('message-container');

    // Fonction améliorée pour formater la date
    function formatDate(dateStr) {
        if (!dateStr) return '';

        // Si la date est déjà au format français (dd/mm/yyyy)
        if (dateStr.includes('/')) return dateStr;

        // Gérer le format SQL (yyyy-mm-dd)
        const [ year, month, day ] = dateStr.split('-');
        if (year && month && day) {
            return `${ day }/${ month }/${ year }`;
        }

        return 'Date invalide';
    }

    // Fonction pour formater les montants
    function formatMontant(montant) {
        return Number(montant || 0).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async function chargerOperations() {
        try {
            const response = await fetch('api/listerOperations.php', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="20" class="text-center">Aucune opération trouvée</td>
                    </tr>`;
                return;
            }

            tableBody.innerHTML = data.map(op => `
                <tr>
                    <td>${ op.numPiece || '' }</td>
                    <td>${ formatDate(op.datePiece) }</td>
                    <td>${ formatDate(op.dateOperation) }</td>
                    <td>${ op.nomDocument || '' }</td>
                    <td>${ op.numDoc || '' }</td>
                    <td>${ op.typeDocument || '' }</td>
                    <td>${ op.exercice || '' }</td>
                    <td>${ op.devise || '' }</td>
                    <td>${ op.beneficiaire || '' }</td>
                    <td>${ op.debiteur || '' }</td>
                    <td>${ op.motif || '' }</td>
                    <td>${ op.code_anal || '' }</td>
                    <td>${ op.imputation || '' }</td>
                    <td>${ op.numero_compte || '' }</td>
                    <td>${ op.LibelleOperation || '' }</td>
                    <td class="text-end">${ formatMontant(op.MontantDebit) }</td>
                    <td class="text-end">${ formatMontant(op.MontantCredit) }</td>
                    <td>${ op.CompteDebit || '' }</td>
                    <td>${ op.CompteCredit || '' }</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="voirDetails('${ op.numPiece }')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Erreur:', error);
            if (messageContainer) {
                messageContainer.innerHTML = `
                    <div class="alert alert-danger">
                        ${ error.message || 'Erreur lors du chargement des données' }
                    </div>`;
            }
        }
    }

    // Chargement initial
    await chargerOperations();
});

// Details view function (to be implemented)
function voirDetails(numPiece) {
    console.log('Voir détails pour:', numPiece);
}