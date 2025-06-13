document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.getElementById('tableOperations');

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

            const operations = await response.json();

            tableBody.innerHTML = operations.map(op => `
                <tr>
                    <td>${ op.numPiece }</td>
                    <td>${ op.datePiece }</td>
                    <td>${ op.typeDocument }</td>
                    <td>${ op.beneficiaire }</td>
                    <td>${ op.motif }</td>
                    <td class="text-end">${ op.totalDebit.toFixed(2) }</td>
                    <td class="text-end">${ op.totalCredit.toFixed(2) }</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="voirDetails('${ op.numPiece }')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Erreur:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        Erreur lors du chargement des opérations
                    </td>
                </tr>
            `;
        }
    }

    // Chargement initial
    chargerOperations();
});