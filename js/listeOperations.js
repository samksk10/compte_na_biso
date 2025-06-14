document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById('tableOperations');
    const messageContainer = document.getElementById('message-container');

    function afficherMessage(message, type = 'info') {
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert alert-${ type } alert-dismissible fade show">
                    ${ message }
                </div>`;
        }
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

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur serveur');
            }

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
                    <td>${ op.datePiece || '' }</td>
                    <td>${ op.dateOperation || '' }</td>
                    <td>${ op.codeJournal || '' }</td>
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
                    <td class="text-end">${ Number(op.MontantDebit || 0).toFixed(2) }</td>
                    <td class="text-end">${ Number(op.MontantCredit || 0).toFixed(2) }</td>
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
            afficherMessage(error.message, 'danger');
        }
    }

    // Chargement initial
    await chargerOperations();
});

// Details view function (to be implemented)
function voirDetails(numPiece) {
    console.log('Voir détails pour:', numPiece);
}