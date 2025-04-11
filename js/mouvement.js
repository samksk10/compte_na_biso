document.addEventListener('DOMContentLoaded', function () {
    // Soumission du formulaire
    document.getElementById('mouvementForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const numPiece = document.getElementById('numPiece').value.trim();
        const datePiece = document.getElementById('datePiece').value;
        const devise = document.getElementById('devise').value;

        const lignes = [];
        const rows = document.querySelectorAll('#operationsTable tbody tr');

        rows.forEach(row => {
            const ligne = {
                numeroMouvement: row.querySelector('input[name="numeroMouvement[]"]')?.value || '',
                codeAnalytique: row.querySelector('input[name="codeAnalytique[]"]')?.value || '',
                debit: parseFloat(row.querySelector('input[name="debit[]"]')?.value) || 0,
                credit: parseFloat(row.querySelector('input[name="credit[]"]')?.value) || 0,
                imputation: row.querySelector('input[name="imputation[]"]')?.value || '',
                montant: parseFloat(row.querySelector('input[name="montant[]"]')?.value) || 0,
                sousCompte: row.querySelector('input[name="sousCompte[]"]')?.value || '',
                solde: parseFloat(row.querySelector('input[name="solde[]"]')?.value) || 0,
            };
            lignes.push(ligne);
        });

        const mouvement = {
            numPiece,
            datePiece,
            devise,
            operations: lignes
        };

        console.log("Mouvement enregistré :", mouvement);
        alert("Mouvement enregistré avec succès !");

        // Ici tu peux envoyer les données au backend
        // fetch('/api/mouvements.php', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(mouvement)
        // });

        // Optionnel : reset du formulaire
        document.getElementById('mouvementForm').reset();
        document.querySelector('#operationsTable tbody').innerHTML = '';
    });
});

function ajouterLigne() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="form-control" name="numeroMouvement[]" required></td>
        <td><input type="text" class="form-control" name="codeAnalytique[]"></td>
        <td><input type="number" class="form-control" name="debit[]" step="0.01" min="0"></td>
        <td><input type="number" class="form-control" name="credit[]" step="0.01" min="0"></td>
        <td><input type="text" class="form-control" name="imputation[]"></td>
        <td><input type="number" class="form-control" name="montant[]" step="0.01" min="0"></td>
        <td><input type="text" class="form-control" name="sousCompte[]"></td>
        <td><input type="number" class="form-control" name="solde[]" step="0.01" min="0"></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLigne(this)">Supprimer</button></td>
    `;
    document.querySelector('#operationsTable tbody').appendChild(row);
}

function supprimerLigne(btn) {
    btn.closest('tr').remove();
}
