document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById('tableOperations');
    const filtreAnnee = document.getElementById('filtreAnnee');
    const messageContainer = document.getElementById('message-container');
    let allOperations = [];

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
            maximumFractionDigits: 2,
            useGrouping: true
        }).replace(/\s/g, ''); // Supprime les espaces indésirables
    }

    // Fonction pour charger les opérations
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
                throw new Error('Erreur réseau');
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="18" class="text-center">Aucune opération trouvée</td></tr>';
                return;
            }

            // Filtrer les opérations pour ne garder que OD et JD
            const filteredData = data.filter(op => op.typeDocument === 'OD' || op.typeDocument === 'JD');

            if (filteredData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="18" class="text-center">Aucune opération EB ou SB trouvée</td></tr>';
                return;
            }

            allOperations = filteredData; // Stocke toutes les opérations
            remplirSelectAnnees(filteredData);
            afficherOperations(filteredData);

        } catch (error) {
            console.error('Erreur:', error);
            if (messageContainer) {
                messageContainer.innerHTML = `
                    <div class="alert alert-danger">
                        Une erreur est survenue lors du chargement des opérations
                    </div>
                `;
            }
        }
    }

    // Fonction pour remplir le select des années
    function remplirSelectAnnees(data) {
        const annees = [ ...new Set(data.map(op => op.exercice)) ].sort().reverse();
        filtreAnnee.innerHTML = '<option value="">Toutes</option>';
        annees.forEach(annee => {
            if (annee) {
                filtreAnnee.innerHTML += `<option value="${ annee }">${ annee }</option>`;
            }
        });
    }

    // Fonction pour afficher les opérations filtrées
    function afficherOperations(operations) {
        tableBody.innerHTML = operations.map(op => `
            <tr>
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
            </tr>
        `).join('');
    }

    // Filtrer lors du changement d'année
    filtreAnnee.addEventListener('change', function () {
        const annee = this.value;
        if (!annee) {
            afficherOperations(allOperations);
        } else {
            afficherOperations(allOperations.filter(op => op.exercice == annee));
        }
    });

    // Export to Excel function
    document.getElementById('exportExcel').addEventListener('click', async () => {
        try {
            // Show loading spinner
            const button = document.getElementById('exportExcel');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> Export en cours...';
            button.disabled = true;

            // Use setTimeout to allow UI update
            setTimeout(() => {
                const wb = XLSX.utils.table_to_book(document.querySelector('table'), {
                    sheet: "Operations",
                    cellStyles: false // Disable cell styles for faster processing
                });
                XLSX.writeFile(wb, `Operations_${ new Date().toISOString().split('T')[ 0 ] }.xlsx`);

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            }, 100);
        } catch (error) {
            console.error('Export Excel error:', error);
            alert('Erreur lors de l\'export Excel');
        }
    });

    // Export to PDF function
    document.getElementById('exportPdf').addEventListener('click', async () => {
        try {
            // Show loading spinner
            const button = document.getElementById('exportPdf');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> Export en cours...';
            button.disabled = true;

            // Use setTimeout to allow UI update
            setTimeout(() => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('l', 'pt', 'a3');

                doc.autoTable({
                    html: 'table',
                    theme: 'grid',
                    headStyles: { fillColor: [ 52, 58, 64 ] },
                    pageBreak: 'auto',
                    styles: {
                        fontSize: 8,
                        cellPadding: 2
                    },
                    columnStyles: {
                        14: { halign: 'right' },
                        15: { halign: 'right' }
                    },
                    margin: { top: 30 },
                    didParseCell: (data) => {
                        // Only process cells that need formatting
                        if (data.column.index === 14 || data.column.index === 15) {
                            if (data.cell.raw) {
                                data.cell.text = data.cell.raw.toString().replace(/\s/g, '');
                            }
                        }
                    }
                });

                doc.save(`Operations_${ new Date().toISOString().split('T')[ 0 ] }.pdf`);

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            }, 100);
        } catch (error) {
            console.error('Export PDF error:', error);
            alert('Erreur lors de l\'export PDF');
        }
    });

    // Chargement initial
    await chargerOperations();
});

// Details view function (to be implemented)
function voirDetails(numPiece) {
    console.log('Voir détails pour:', numPiece);
}