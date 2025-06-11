document.addEventListener("DOMContentLoaded", async () => {
    // ---------- Éléments DOM ----------
    const form = document.getElementById("mouvementForm");
    const tableBody = document.querySelector("table tbody");
    const ligneTemplate = document.getElementById("ligneTemplate");
    const totalDebitEl = document.getElementById("totalDebit");
    const totalCreditEl = document.getElementById("totalCredit");
    const balanceEl = document.getElementById("balance");
    const messageContainer = document.getElementById("message-container");
    document.getElementById('userNom').style.color = '#1DA1F2';  // Bleu Twitter
    document.getElementById('userRole').style.color = '#E0245E'; // Rouge utilisé par Twitter pour erreurs/alertes


    // Cache pour les options des comptes
    let cachedCompteOptions = null;

    // ---------- Fonctions principales ----------

    // Charge les options de compte (optimisé : ne fetch qu'une fois)
    async function chargerOptionsCompte(targetSelect = null) {
        try {
            if (!cachedCompteOptions) {
                const response = await fetch("http://localhost/compte_na_biso/api/lister.php", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache" // Ajout important
                    },
                    credentials: "include"  // Ajout important
                });
                if (!response.ok) throw new Error("Erreur de chargement");
                cachedCompteOptions = await response.text();
            }

            const targets = targetSelect
                ? [ targetSelect ]
                : document.querySelectorAll('select[name="numero_compte[]"]');

            targets.forEach(select => {
                select.innerHTML = '<option value="">Sélectionnez...</option>' + cachedCompteOptions;

                // Initialiser Select2
                $(select).select2({
                    theme: 'bootstrap-5',
                    width: '100%',
                    language: {
                        noResults: () => "Aucun compte trouvé",
                        searching: () => "Recherche...",
                        inputTooShort: () => "Veuillez entrer au moins 1 caractère"
                    },
                    placeholder: "Rechercher un compte...",
                    allowClear: true,
                    minimumInputLength: 1,
                    matcher: function (params, data) {
                        // Fonction de recherche personnalisée
                        if (!params.term) {
                            return data;
                        }

                        const term = params.term.toLowerCase();
                        const text = data.text.toLowerCase();

                        if (text.indexOf(term) > -1) {
                            return data;
                        }

                        return null;
                    }
                });
            });
        } catch (error) {
            console.error("Erreur:", error);
            afficherMessage("Erreur de chargement des comptes", "danger");
        }
    }

    // Fonction pour charger les codes analytiques
    async function chargerCodesAnalytiques() {
        try {
            const response = await fetch('api/comptesAnalytiques.php', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${ response.status }`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur lors du chargement des codes analytiques:', error);
            return [];
        }
    }

    // Fonction pour initialiser Select2 sur un élément
    function initialiserSelect2(element) {
        $(element).select2({
            theme: 'bootstrap-5',
            width: '100%',
            placeholder: 'Sélectionner un code...'
        });
    }

    // Fonction pour remplir les options du select
    async function remplirOptionsCodesAnalytiques(selectElement) {
        const codes = await chargerCodesAnalytiques();
        selectElement.innerHTML = '<option value="">Sélectionner un code...</option>';

        codes.forEach(code => {
            const option = document.createElement('option');
            option.value = code.code_anal;
            option.textContent = `${ code.code_anal } - ${ code.desi_anal }`;
            selectElement.appendChild(option);
        });

        initialiserSelect2(selectElement);
    }

    // Gestion de l'envoi du formulaire
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validation et préparation des données...
        if (!validerFormulaire()) return;

        const donnees = {
            entete: preparerEntete(),
            lignes: preparerLignes()
        };

        console.log('Données envoyées :', donnees); // Debug log

        try {
            const response = await fetch("http://localhost/compte_na_biso/api/enregistrerBanque.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(donnees)
            });

            const result = await response.json();
            console.log('Réponse reçue :', result); // Debug log
            gererReponseAPI(result);
        } catch (error) {
            gererErreur(error);
        }
    });

    // ---------- Fonctions utilitaires ----------

    function validerEquilibre() {
        let totalDebit = 0;
        let totalCredit = 0;

        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const montantDebit = parseFloat(row.querySelector('input[name="MontantDebit[]"]').value || 0);
            const montantCredit = parseFloat(row.querySelector('input[name="MontantCredit[]"]').value || 0);

            totalDebit += montantDebit;
            totalCredit += montantCredit;
        });

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            afficherMessage('Le total débit doit égaler le total crédit', 'danger');
            return false;
        }

        return true;
    }

    function validerFormulaire() {
        const form = document.getElementById('mouvementForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const tableBody = document.getElementById('tableBody');
        if (!tableBody || tableBody.children.length === 0) {
            afficherMessage('Veuillez ajouter au moins une ligne d\'opération', 'danger');
            return false;
        }

        // Validation de l'équilibre débit/crédit
        if (!validerEquilibre()) {
            return false;
        }

        return true;
    }

    function preparerEntete() {
        // Create an object to store all required field IDs
        const requiredFields = {
            codeJournal: 'codeJournal',
            typeDocument: 'typeDocument',
            nomDocument: 'nomDocument',
            numDoc: 'numDoc',
            exercice: 'exercice',
            beneficiaire: 'beneficiaire',
            debiteur: 'debiteur',
            motif: 'motif',
            dateOperation: 'dateOperation',
            datePiece: 'datePiece',
            devise: 'devise'
        };

        // Check if all required elements exist
        for (const [ key, id ] of Object.entries(requiredFields)) {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`Element with ID '${ id }' not found`);
                throw new Error(`Champ requis manquant: ${ key }`);
            }
        }

        // Now safely create the entete object
        return {
            numPiece: document.getElementById('numPiece').value.trim(),
            codeJournal: document.getElementById('codeJournal').value.trim(),
            typeDocument: document.getElementById('typeDocument').value.trim(),
            nomDocument: document.getElementById('nomDocument').value.trim(),
            numDoc: document.getElementById('numDoc').value.trim(),
            exercice: document.getElementById('exercice').value.trim(),
            beneficiaire: document.getElementById('beneficiaire').value.trim(),
            debiteur: document.getElementById('debiteur').value.trim(),
            motif: document.getElementById('motif').value.trim(),
            dateOperation: document.getElementById('dateOperation').value,
            datePiece: document.getElementById('datePiece').value,
            devise: document.getElementById('devise').value || 'USD',
            tauxChange: 1.0
        };
    }

    function preparerLignes() {
        return Array.from(tableBody.querySelectorAll("tr")).map((row, index) => {
            const imputation = row.querySelector('select[name="imputation[]"]').value;
            const code_anal = row.querySelector('select[name="t6_CodeAnal[]"]').value;
            const numero_compte = row.querySelector('select[name="numero_compte[]"]').value;
            const libelle_operation = row.querySelector('input[name="libelleOperation[]"]').value;
            const montantDebit = row.querySelector('input[name="MontantDebit[]"]').value || '0';
            const montantCredit = row.querySelector('input[name="MontantCredit[]"]').value || '0';

            return {
                numeroLigneOperation: index + 1,
                code_anal: code_anal,
                imputation: imputation,
                numero_compte: numero_compte,
                libelle_operation: libelle_operation,
                montant: parseFloat(imputation === 'DEBIT' ? montantDebit : montantCredit),
                compteDebit: imputation === 'DEBIT' ? numero_compte : '',
                compteCredit: imputation === 'CREDIT' ? numero_compte : '',
                solde: 0
            };
        });
    }

    function gererReponseAPI(result) {
        if (result.success) {
            afficherMessage("Succès!", "success");
            resetForm();
        } else {
            afficherMessage(result.message || "Erreur", "danger");
        }
    }

    function gererErreur(error) {
        console.error(error);
        afficherMessage("Erreur réseau", "danger");
    }

    // ---------- Fonctions existantes modifiées ----------

    // Fonction pour générer le numéro d'opération
    function genererNumeroOperation() {
        const date = new Date();
        const annee = date.getFullYear().toString().slice(-2);
        const mois = (date.getMonth() + 1).toString().padStart(2, '0');
        const jour = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `OPB${ annee }${ mois }${ jour }-${ random }`;
    }

    // Fonction pour définir la date du jour et l'exercice
    function setDateDuJour() {
        const today = new Date();
        const dateISO = today.toISOString().split('T')[ 0 ];
        document.getElementById('datePiece').value = dateISO;
        document.getElementById('dateOperation').value = dateISO;
        updateExercice(); // Mise à jour initiale de l'exercice
    }

    // Ajoutons une nouvelle fonction pour mettre à jour l'exercice
    function updateExercice() {
        const dateOperation = document.getElementById('dateOperation').value;
        const exercice = dateOperation ? new Date(dateOperation).getFullYear().toString() : '';
        document.getElementById('exercice').value = exercice;
    }

    // Initialisation des champs automatiques
    function initialiserChampsAuto() {
        document.getElementById('numPiece').value = genererNumeroOperation();
        setDateDuJour();
    }

    function handleImputationChange(row) {
        console.log('handleImputationChange appelé'); // Debug

        const imputationSelect = row.querySelector('select[name="imputation[]"]');
        const compteOperationSelect = row.querySelector('select[name="numero_compte[]"]');
        const compteDebitInput = row.querySelector('input[name="CompteDebit[]"]');
        const compteCreditInput = row.querySelector('input[name="CompteCredit[]"]');
        const montantDebitInput = row.querySelector('input[name="MontantDebit[]"]');
        const montantCreditInput = row.querySelector('input[name="MontantCredit[]"]');

        const selectedAccount = compteOperationSelect.value;
        const selectedImputation = imputationSelect.value;

        console.log('Compte sélectionné:', selectedAccount); // Debug
        console.log('Imputation sélectionnée:', selectedImputation); // Debug

        // Réinitialiser les champs
        compteDebitInput.value = '';
        compteCreditInput.value = '';

        if (selectedAccount && selectedImputation) {
            if (selectedImputation === 'DEBIT') {
                compteDebitInput.value = selectedAccount;
                montantDebitInput.disabled = false;
                montantCreditInput.disabled = true;
                montantCreditInput.value = '';
            } else if (selectedImputation === 'CREDIT') {
                compteCreditInput.value = selectedAccount;
                montantCreditInput.disabled = false;
                montantDebitInput.disabled = true;
                montantDebitInput.value = '';
            }
        }

        // Recalculer les totaux après changement
        recalculerTotaux();
    }

    function updateSelectOptions(select, value, text) {
        // Vider les options existantes sauf la première (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Ajouter la nouvelle option
        const option = new Option(text, value, true, true);
        select.add(option);
        select.value = value;
    }

    // Modifier la fonction ajouterLigne pour inclure l'initialisation du select
    window.ajouterLigne = () => {
        const clone = ligneTemplate.content.cloneNode(true);
        const newRow = clone.querySelector("tr");
        const ligneNumero = tableBody.querySelectorAll("tr").length + 1;

        // Mise à jour du numéro de ligne
        newRow.querySelector("td").textContent = ligneNumero;

        // Récupérer les selects et inputs
        const imputationSelect = newRow.querySelector('select[name="imputation[]"]');
        const compteOperationSelect = newRow.querySelector('select[name="numero_compte[]"]');
        const codeAnalSelect = newRow.querySelector('select[name="t6_CodeAnal[]"]');

        // Ajouter les écouteurs d'événements
        imputationSelect.addEventListener('change', () => handleImputationChange(newRow));

        // Initialiser Select2 pour le compte opération
        $(compteOperationSelect).select2({
            theme: 'bootstrap-5',
            width: '100%'
        }).on('select2:select', () => handleImputationChange(newRow));

        // Initialiser Select2 pour le code analytique
        remplirOptionsCodesAnalytiques(codeAnalSelect);

        // Ajouter la ligne au tableau
        tableBody.appendChild(newRow);

        // Charger les options de compte
        chargerOptionsCompte(compteOperationSelect);
    };

    window.resetForm = () => {
        form.reset();
        tableBody.innerHTML = "";
        [ totalDebitEl, totalCreditEl, balanceEl ].forEach(el => el.textContent = "0.00");
        initialiserChampsAuto();
    };

    function afficherMessage(message, type) {
        messageContainer.innerHTML = `
            <div class="alert alert-${ type }">${ message }</div>
        `;
        setTimeout(() => messageContainer.innerHTML = "", 5000);
    }

    // ---------- Initialisation ----------
    await chargerOptionsCompte();
    tableBody.addEventListener("input", recalculerTotaux);
    initialiserChampsAuto(); // Initialisation des champs automatiques

    // Charger les codes analytiques pour la première ligne au chargement
    const premiereSelectAnalytique = document.querySelector('select[name="t6_CodeAnal[]"]');
    if (premiereSelectAnalytique) {
        remplirOptionsCodesAnalytiques(premiereSelectAnalytique);
    }

    // Ajouter l'écouteur d'événements pour la date d'opération
    document.getElementById('dateOperation').addEventListener('change', updateExercice);
});

// Fonction de calcul des totaux (peut rester identique)
function recalculerTotaux() {
    let totalDebit = 0;
    let totalCredit = 0;

    tableBody.querySelectorAll('tr').forEach(row => {
        totalDebit += parseFloat(row.querySelector('input[name="MontantDebit[]"]').value || 0);
        totalCredit += parseFloat(row.querySelector('input[name="MontantCredit[]"]').value || 0);
    });

    document.getElementById('totalDebit').textContent = totalDebit.toFixed(2);
    document.getElementById('totalCredit').textContent = totalCredit.toFixed(2);
    document.getElementById('balance').textContent = (totalDebit - totalCredit).toFixed(2);
}

// Ajoutez un peu de style CSS personnalisé
const style = document.createElement('style');
style.textContent = `
    .select2-container--bootstrap-5 .select2-selection {
        height: calc(1.5em + 0.5rem + 2px);
        font-size: .875rem;
    }
    .select2-container--bootstrap-5 .select2-selection--single {
        padding-top: 0.15rem;
    }
    .select2-container--bootstrap-5 .select2-selection--single .select2-selection__clear {
        height: calc(1.5em + 0.5rem);
    }
`;
document.head.appendChild(style);

async function sauvegarderOperation(data) {
    try {
        const response = await fetch('api/enregistrerBanque.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Réponse non-JSON reçue du serveur");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Erreur inconnue");
        }

        return result;

    } catch (error) {
        console.error('Erreur détaillée:', error);
        throw new Error(`Erreur lors de l'enregistrement: ${ error.message }`);
    }
}