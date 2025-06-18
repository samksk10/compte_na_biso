document.addEventListener('DOMContentLoaded', () => {
    const balanceForm = document.getElementById('balanceForm');
    const balanceTable = document.getElementById('balanceTable');

    // Charger les exercices disponibles
    async function loadExercices() {
        try {
            const response = await fetch('api/exercices.php');
            const exercices = await response.json();
            const select = document.getElementById('exercice');

            exercices.forEach(ex => {
                const option = document.createElement('option');
                option.value = ex.id;
                option.textContent = ex.annee;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des exercices:', error);
        }
    }

    // Charger la balance
    async function loadBalance(dateDebut, dateFin, exercice) {
        try {
            const response = await fetch(`api/balance.php?dateDebut=${ dateDebut }&dateFin=${ dateFin }&exercice=${ exercice }`);
            const data = await response.json();

            if (!data.length) {
                balanceTable.innerHTML = '<tr><td colspan="8" class="text-center">Aucune donnée disponible</td></tr>';
                return;
            }

            let totalSD = 0, totalSC = 0, totalMD = 0, totalMC = 0, totalFD = 0, totalFC = 0;

            balanceTable.innerHTML = data.map(item => {
                totalSD += parseFloat(item.soldeInitialDebit || 0);
                totalSC += parseFloat(item.soldeInitialCredit || 0);
                totalMD += parseFloat(item.mouvementDebit || 0);
                totalMC += parseFloat(item.mouvementCredit || 0);
                totalFD += parseFloat(item.soldeFinalDebit || 0);
                totalFC += parseFloat(item.soldeFinalCredit || 0);

                return `
                    <tr>
                        <td>${ item.numeroCompte }</td>
                        <td>${ item.intitule }</td>
                        <td class="text-end">${ formatMontant(item.soldeInitialDebit) }</td>
                        <td class="text-end">${ formatMontant(item.soldeInitialCredit) }</td>
                        <td class="text-end">${ formatMontant(item.mouvementDebit) }</td>
                        <td class="text-end">${ formatMontant(item.mouvementCredit) }</td>
                        <td class="text-end">${ formatMontant(item.soldeFinalDebit) }</td>
                        <td class="text-end">${ formatMontant(item.soldeFinalCredit) }</td>
                    </tr>
                `;
            }).join('');

            // Mettre à jour les totaux
            document.getElementById('totalSoldeInitialDebit').textContent = formatMontant(totalSD);
            document.getElementById('totalSoldeInitialCredit').textContent = formatMontant(totalSC);
            document.getElementById('totalMouvementDebit').textContent = formatMontant(totalMD);
            document.getElementById('totalMouvementCredit').textContent = formatMontant(totalMC);
            document.getElementById('totalSoldeFinalDebit').textContent = formatMontant(totalFD);
            document.getElementById('totalSoldeFinalCredit').textContent = formatMontant(totalFC);

        } catch (error) {
            console.error('Erreur lors du chargement de la balance:', error);
            balanceTable.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Une erreur est survenue</td></tr>';
        }
    }

    // Formater les montants
    function formatMontant(montant) {
        return Number(montant || 0).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Gestionnaire de soumission du formulaire
    balanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dateDebut = document.getElementById('dateDebut').value;
        const dateFin = document.getElementById('dateFin').value;
        const exercice = document.getElementById('exercice').value;

        await loadBalance(dateDebut, dateFin, exercice);
    });

    // Chargement initial des exercices
    loadExercices();
});