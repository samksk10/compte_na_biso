
// Stockage des journaux
let journals = JSON.parse(localStorage.getItem('journals')) || [];
let currentJournalId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    renderJournalTable();

    // Gestion du formulaire
    document.getElementById('journalForm').addEventListener('submit', handleFormSubmit);

    // Événement pour le modal
    document.getElementById('journalModal').addEventListener('hidden.bs.modal', resetForm);
});

// Afficher les journaux dans le tableau
function renderJournalTable() {
    const tableBody = document.getElementById('journalTableBody');
    tableBody.innerHTML = '';

    if (journals.length === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center text-muted py-4">
                            Aucun journal disponible. Cliquez sur "Ajouter un Journal" pour commencer.
                        </td>
                    </tr>`;
        return;
    }

    journals.forEach(journal => {
        const row = document.createElement('tr');
        row.innerHTML = `
    <td>${ journal.code }</td>
    <td>${ journal.libelle }</td>
    <td class="action-buttons">
        <button class="btn btn-sm btn-warning edit-btn" data-id="${ journal.id }"
            aria-label="Modifier le journal ${ journal.code }">
            <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${ journal.id }"
            aria-label="Supprimer le journal ${ journal.code }">
            <i class="bi bi-trash"></i>
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

// Gérer la soumission du formulaire
function handleFormSubmit(e) {
    e.preventDefault();

    const code = document.getElementById('codeJournal').value.trim();
    const libelle = document.getElementById('libelleJournal').value.trim();
    const form = e.target;

    // Validation simple
    if (!code || !libelle) {
        form.classList.add('was-validated');
        return;
    }

    if (currentJournalId) {
        // Mise à jour
        const index = journals.findIndex(j => j.id === currentJournalId);
        if (index !== -1) {
            journals[ index ] = { id: currentJournalId, code, libelle };
        }
    } else {
        // Ajout
        const newJournal = {
            id: Date.now().toString(),
            code,
            libelle
        };
        journals.unshift(newJournal);
    }

    // Sauvegarder et rafraîchir
    saveJournals();
    renderJournalTable();

    // Fermer le modal
    bootstrap.Modal.getInstance(document.getElementById('journalModal')).hide();
}

// Gérer l'édition
function handleEdit(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const journal = journals.find(j => j.id === id);

    if (journal) {
        currentJournalId = journal.id;
        document.getElementById('journalId').value = journal.id;
        document.getElementById('codeJournal').value = journal.code;
        document.getElementById('libelleJournal').value = journal.libelle;

        // Mettre à jour le titre du modal
        document.getElementById('journalModalLabel').textContent = 'Modifier le Journal';

        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById('journalModal'));
        modal.show();
    }
}

// Gérer la suppression
function handleDelete(e) {
    const id = e.currentTarget.getAttribute('data-id');
    currentJournalId = id;

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();

    document.getElementById('confirmDelete').onclick = function () {
        journals = journals.filter(j => j.id !== id);
        saveJournals();
        renderJournalTable();
        modal.hide();
    };
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('journalForm').reset();
    document.getElementById('journalForm').classList.remove('was-validated');
    document.getElementById('journalId').value = '';
    currentJournalId = null;
    document.getElementById('journalModalLabel').textContent = 'Ajouter un Journal';
}

// Sauvegarder dans le localStorage
function saveJournals() {
    localStorage.setItem('journals', JSON.stringify(journals));
}
function ajouterLigne() {
    let table = document.getElementById("journalTable").getElementsByTagName('tbody')[ 0 ];
    let row = table.insertRow();

    row.innerHTML = `
                <td><input type="text" class="form-control" name="compte[]" required></td>
                <td><input type="text" class="form-control" name="libelle[]" required></td>
                <td><input type="number" class="form-control" name="debit[]" step="0.01"></td>
                <td><input type="number" class="form-control" name="credit[]" step="0.01"></td>
                <td><button class="btn btn-danger" onclick="supprimerLigne(this)">Supprimer</button></td>
            `;
}

function supprimerLigne(btn) {
    let row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}
