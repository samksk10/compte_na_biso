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

        try {
            const response = await fetch("http://localhost/compte_na_biso/api/enregistrerBanque.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entete: preparerEntete(),
                    lignes: preparerLignes()
                })
            });

            const result = await response.json();
            gererReponseAPI(result);
        } catch (error) {
            gererErreur(error);
        }
    });

    // ---------- Fonctions utilitaires ----------

    function validerFormulaire() {
        const lignes = tableBody.querySelectorAll("tr");
        if (lignes.length === 0) {
            afficherMessage("Ajoutez au moins une ligne", "danger");
            return false;
        }
        return true;
    }

    function preparerEntete() {
        return {
            numMouv: form.numPiece.value.trim(),
            dateSaisie: form.datePiece.value,
            // ... (autres champs comme avant)
        };
    }

    function preparerLignes() {
        return Array.from(tableBody.querySelectorAll("tr")).map((row, index) => ({
            numeroLigneOperation: index + 1,
            // ... (mapping des champs comme avant)
        }));
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
        return `OPD${ annee }${ mois }${ jour }-${ random }`;
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
    await chargerOptionsCompte(); // Charge les comptes au démarrage
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
    // ... (identique à ton code actuel)
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