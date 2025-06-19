document.addEventListener('DOMContentLoaded', () => {
    const grandLivreForm = document.getElementById('grandLivreForm');
    const ecrituresTable = document.getElementById('ecrituresTable');
    const compteDetails = document.getElementById('compteDetails');

    // Charger les exercices
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
            console.error('Erreur:', error);
        }
    }

    // Charger les comptes
    async function loadComptes() {
        try {
            const response = await fetch('api/comptes.php');
            const comptes = await response.json();
            const select = document.getElementById('compte');

            comptes.forEach(compte => {
                const option = document.createElement('option');
                option.value = compte.numero;
                option.textContent = `${ compte.numero } - ${ compte.intitule }`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    // Charger les écritures
    async function loadEcritures(compte, dateDebut, dateFin, exercice) {
        try {
            const response = await fetch(`api/grandLivre.php?compte=${ compte }&dateDebut=${ dateDebut }&dateFin=${ dateFin }&exercice=${ exercice }`);
            const data = await response.json();

            if (!data.ecritures || !data.ecritures.length) {
                ecrituresTable.innerHTML = '<tr><td colspan="7" class="text-center">Aucune écriture trouvée</td></tr>';
                compteDetails.classList.add('d-none');
                return;
            }

            // Afficher les détails du compte
            document.getElementById('compteNumero').textContent = data.compte.numero;
            document.getElementById('compteIntitule').textContent = data.compte.intitule;
            document.getElementById('compteClasse').textContent = data.compte.classe;
            document.getElementById('soldeinitial').textContent = formatMontant(data.soldeInitial);
            document.getElementById('soldefinal').textContent = formatMontant(data.soldeFinal);
            compteDetails.classList.remove('d-none');

            // Afficher les écritures
            let soldeProgressif = parseFloat(data.soldeInitial);
            let totalDebit = 0;
            let totalCredit = 0;

            ecrituresTable.innerHTML = data.ecritures.map(e => {
                totalDebit += parseFloat(e.debit || 0);
                totalCredit += parseFloat(e.credit || 0);
                soldeProgressif += parseFloat(e.debit || 0) - parseFloat(e.credit || 0);

                return `
                    <tr>
                        <td>${ formatDate(e.date) }</td>
                        <td>${ e.numPiece }</td>
                        <td>${ e.journal }</td>
                        <td>${ e.libelle }</td>
                        <td class="text-end">${ formatMontant(e.debit) }</td>
                        <td class="text-end">${ formatMontant(e.credit) }</td>
                        <td class="text-end">${ formatMontant(soldeProgressif) }</td>
                    </tr>
                `;
            }).join('');

            // Mettre à jour les totaux
            document.getElementById('totalDebit').textContent = formatMontant(totalDebit);
            document.getElementById('totalCredit').textContent = formatMontant(totalCredit);
            document.getElementById('soldeProgressif').textContent = formatMontant(soldeProgressif);

        } catch (error) {
            console.error('Erreur:', error);
            ecrituresTable.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Une erreur est survenue</td></tr>';
        }
    }

    // Formater les montants
    function formatMontant(montant) {
        return Number(montant || 0).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        });
    }

    // Formater les dates
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    }

    // Gestionnaire de soumission du formulaire
    grandLivreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const compte = document.getElementById('compte').value;
        const dateDebut = document.getElementById('dateDebut').value;
        const dateFin = document.getElementById('dateFin').value;
        const exercice = document.getElementById('exercice').value;

        await loadEcritures(compte, dateDebut, dateFin, exercice);
    });

    // Chargement initial
    loadExercices();
    loadComptes();
});