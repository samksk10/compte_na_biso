// Stockage des journaux et mouvements
let journals = JSON.parse(localStorage.getItem('journals')) || [];
let mouvements = JSON.parse(localStorage.getItem('mouvements')) || [];
let currentJournalId = null;
let currentMouvementId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    renderJournalTable();
    setupFormEventListeners();
});

function setupFormEventListeners() {
    // Gestion du formulaire de mouvement
    document.getElementById('mouvementForm')?.addEventListener('submit', handleMouvementSubmit);

    // Événement pour le modal de confirmation
    document.getElementById('confirmModal')?.addEventListener('hidden.bs.modal', resetForm);
}

// Afficher les journaux dans le tableau
function renderJournalTable() {
    const tableBody = document.getElementById('journalTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (journals.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Aucun journal disponible.
                </td>
            </tr>`;
        return;
    }

    journals.forEach(journal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ journal.code }</td>
            <td>${ journal.libelle }</td>
            <td class="text-center">${ journal.dateCreation || 'N/A' }</td>
            <td class="text-center">${ journal.derniereModification || 'N/A' }</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning edit-btn" data-id="${ journal.id }"
                    aria-label="Modifier le journal ${ journal.code }">
                    <i class="bi bi-pencil"></i> Modifier
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${ journal.id }"
                    aria-label="Supprimer le journal ${ journal.code }">
                    <i class="bi bi-trash"></i> Supprimer
                </button>
            </td>`;
        tableBody.appendChild(row);
    });

    // Ajouter les événements aux boutons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Gérer la soumission du formulaire de mouvement
function handleMouvementSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    // Création de l'objet mouvement
    const mouvement = {
        id: currentMouvementId || Date.now().toString(),
        numPiece: formData.get('numPiece'),
        datePiece: formData.get('datePiece'),
        dateOperation: formData.get('dateOperation'),
        codeJournal: formData.get('codeJournal'),
        typeDocument: formData.get('typeDocument'),
        nomDocument: formData.get('nomDocument'),
        codeComptable: formData.get('codeComptable'),
        exercice: formData.get('exercice'),
        devise: formData.get('devise'),
        beneficiaire: formData.get('beneficiaire'),
        debiteur: formData.get('debiteur'),
        motif: formData.get('motif'),
        operations: getOperationsFromTable(),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
    };

    if (currentMouvementId) {
        // Mise à jour du mouvement
        const index = mouvements.findIndex(m => m.id === currentMouvementId);
        if (index !== -1) {
            mouvements[ index ] = mouvement;
        }
    } else {
        // Ajout d'un nouveau mouvement
        mouvements.unshift(mouvement);
    }

    // Sauvegarder et rafraîchir
    saveMouvements();
    resetForm();
    alert('Mouvement enregistré avec succès!');
}

function getOperationsFromTable() {
    const operations = [];
    const rows = document.querySelectorAll('#operationsTable tbody tr');

    rows.forEach(row => {
        operations.push({
            numeroMouvement: row.querySelector('input[name="numeroMouvement[]"]').value,
            codeAnalytique: row.querySelector('input[name="codeAnalytique[]"]').value,
            debit: parseFloat(row.querySelector('input[name="debit[]"]').value) || 0,
            credit: parseFloat(row.querySelector('input[name="credit[]"]').value) || 0,
            imputation: row.querySelector('input[name="imputation[]"]').value,
            montant: parseFloat(row.querySelector('input[name="montant[]"]').value) || 0,
            sousCompte: row.querySelector('input[name="sousCompte[]"]').value,
            solde: parseFloat(row.querySelector('input[name="solde[]"]').value) || 0
        });
    });

    return operations;
}

// Gérer l'édition d'un mouvement
function handleEdit(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const journal = journals.find(j => j.id === id);

    if (journal) {
        currentJournalId = journal.id;
        document.getElementById('codeJournal').value = journal.code;
        document.getElementById('libelleJournal').value = journal.libelle;

        // Mettre à jour le titre du formulaire
        document.querySelector('h2').textContent = 'Modifier le Journal';

        // Scroll vers le formulaire
        document.getElementById('mouvementForm').scrollIntoView();
    }
}

// Gérer la suppression
function handleDelete(e) {
    const id = e.currentTarget.getAttribute('data-id');
    currentJournalId = id;

    if (confirm('Voulez-vous vraiment supprimer ce journal?')) {
        journals = journals.filter(j => j.id !== id);
        saveJournals();
        renderJournalTable();
    }
}

// Réinitialiser le formulaire
function resetForm() {
    const form = document.getElementById('mouvementForm');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
        document.querySelector('h2').textContent = 'Enregistrer un Mouvement Comptable';
        document.getElementById('operationsTable').querySelector('tbody').innerHTML = '';
        currentMouvementId = null;
    }
}

// Sauvegarder les journaux
function saveJournals() {
    localStorage.setItem('journals', JSON.stringify(journals));
}

// Sauvegarder les mouvements
function saveMouvements() {
    localStorage.setItem('mouvements', JSON.stringify(mouvements));
}

// Ajouter une ligne d'opération
function ajouterLigne() {
    const tbody = document.querySelector('#operationsTable tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" class="form-control" name="numeroMouvement[]" required></td>
        <td><input type="text" class="form-control" name="codeAnalytique[]" required></td>
        <td><input type="number" class="form-control debit-input" name="debit[]" step="0.01" min="0"></td>
        <td><input type="number" class="form-control credit-input" name="credit[]" step="0.01" min="0"></td>
        <td><input type="text" class="form-control" name="imputation[]"></td>
        <td><input type="number" class="form-control montant-input" name="montant[]" step="0.01" min="0"></td>
        <td><input type="text" class="form-control" name="sousCompte[]"></td>
        <td><input type="number" class="form-control solde-input" name="solde[]" step="0.01" readonly></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLigne(this)">Supprimer</button></td>
    `;

    tbody.appendChild(newRow);

    // Ajouter les écouteurs d'événements pour le calcul automatique
    newRow.querySelector('.debit-input').addEventListener('input', updateSolde);
    newRow.querySelector('.credit-input').addEventListener('input', updateSolde);
    newRow.querySelector('.montant-input').addEventListener('input', updateSolde);
}

function updateSolde(e) {
    const row = e.target.closest('tr');
    const debit = parseFloat(row.querySelector('.debit-input').value) || 0;
    const credit = parseFloat(row.querySelector('.credit-input').value) || 0;
    const montant = parseFloat(row.querySelector('.montant-input').value) || 0;

    const solde = montant + debit - credit;
    row.querySelector('.solde-input').value = solde.toFixed(2);
}

function supprimerLigne(btn) {
    const row = btn.closest('tr');
    row.remove();
}