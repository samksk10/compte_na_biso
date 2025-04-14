let numeroMouvement = 1;
const typeJournal = "od";  // "banque", "caisse", "od"

function ajusterParType(newRow) {
    if (typeJournal === "banque") {
        newRow.querySelectorAll('select[name="libelleOperation[]"]').forEach(select => {
            select.innerHTML = `
                        <option value="">Sélectionnez...</option>
                        <option value="EC">Entrée Banque</option>
                        <option value="SC">Sortie Banque</option>
                    `;
        });
    } else if (typeJournal === "caisse") {
        newRow.querySelectorAll('select[name="libelleOperation[]"]').forEach(select => {
            select.innerHTML = `
                        <option value="">Sélectionnez...</option>
                        <option value="EC">Entrée Caisse</option>
                        <option value="SC">Sortie Caisse</option>
                    `;
        });
    } else if (typeJournal === "od") {
        newRow.querySelectorAll('select[name="libelleOperation[]"]').forEach(select => {
            select.innerHTML = `
                        <option value="">Sélectionnez...</option>
                        <option value="OD">Opération diverses</option>
                        <option value="JO">Justificatif des Opérations</option>
                    `;
        });
    }
}

function ajouterLigne() {
    const tableBody = document.getElementById('operationsBody');
    const template = document.getElementById('ligneTemplate');

    const newRow = template.cloneNode(true);
    newRow.removeAttribute('id');
    newRow.style.display = '';

    newRow.querySelector('td').innerText = numeroMouvement++;

    ajusterParType(newRow);

    tableBody.appendChild(newRow);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    // Ajouter une première ligne automatiquement
    ajouterLigne();

    // Afficher le rôle de l'utilisateur
    const userRole = localStorage.getItem('userRole') || 'Comptable Od';
    document.getElementById('userRole').textContent = userRole;
});