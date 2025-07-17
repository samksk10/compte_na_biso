import { CONFIG, Utils } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // Définir le rôle sur le body
    const userRole = Utils.getFromStorage('role');
    document.body.setAttribute('data-role', userRole);

    // Afficher les informations utilisateur
    const userName = Utils.getFromStorage('userName');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');

    if (userNameElement) userNameElement.textContent = userName || 'Utilisateur';
    if (userRoleElement) userRoleElement.textContent = Utils.formatRoleName(userRole) || 'Non défini';

    // Fonction pour charger les statistiques
    async function loadStatistics() {
        try {
            const response = await fetch("http://localhost/compte_na_biso/api/statistics.php", {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Erreur HTTP! statut: ${ response.status }`);

            const data = await response.json();
            console.log('Données reçues:', data);

            // Traitement des statistiques
            processStatistics(data, userRole);

            // Afficher/masquer les sections selon le rôle
            updateDashboardVisibility(userRole);

        } catch (error) {
            console.error('Erreur détaillée:', error);
            Utils.showError('Erreur lors du chargement des statistiques:', error.message);
        }
    }

    // Traitement des statistiques en fonction du rôle
    function processStatistics(data, role) {
        // Statistiques chef comptable (pour super_admin, admin et chef_comptable)
        if (data.chefComptable) {
            updateStatElement('totalOpBanque', data.chefComptable.opBanque);
            updateStatElement('totalOpCaisse', data.chefComptable.opCaisse);
            updateStatElement('totalOpDiverses', data.chefComptable.opDiverses);
            updateStatElement('comptesAnalytiques', data.chefComptable.comptesAnalytiques);
        }

        // Statistiques super_admin
        if (data.super_admin) {
            updateStatElement('totalAdministrateurs', data.super_admin.totalAdministrateurs);
        }

        // Statistiques admin
        if (data.admin) {
            updateStatElement('totalComptables', data.admin.totalComptables);
            updateStatElement('totalChefsComptables', data.admin.totalChefsComptables);
            updateStatElement('totalEntreprises', data.admin.totalEntreprises);
        }

        // Statistiques comptables (nouvelle structure)
        if (data.comptable) {
            // Opérations globales
            updateStatElement('totalOperationsJour', data.comptable.operationsJour);
            updateStatElement('totalOperationsMois', data.comptable.operationsMois);

            // Opérations détaillées par type
            updateStatElement('totalOperationsJourBanque', data.comptable.operationsJourBanque);
            updateStatElement('totalOperationsMoisBanque', data.comptable.operationsMoisBanque);
            updateStatElement('totalOperationsJourCaisse', data.comptable.operationsJourCaisse);
            updateStatElement('totalOperationsMoisCaisse', data.comptable.operationsMoisCaisse);
            updateStatElement('totalOperationsJourOD', data.comptable.operationsJourOD);
            updateStatElement('totalOperationsMoisOD', data.comptable.operationsMoisOD);
        }
    }

    // Fonction pour mettre à jour la visibilité des sections dashboard
    function updateDashboardVisibility(role) {
        // Masquer toutes les sections par défaut
        document.querySelectorAll('.dashboard-section, [class*="comptable_"]').forEach(el => {
            el.style.display = 'none';
        });

        // Définir les sections à afficher selon le rôle
        const showSections = {
            'super_admin': [ 'superAdminDashboard', 'adminDashboard', 'chefComptableDashboard' ],
            'admin': [ 'adminDashboard', 'chefComptableDashboard' ],
            'chef_comptable': [ 'chefComptableDashboard' ],
            'comptable': [ 'comptableDashboard' ],
            'comptable_banque': [ 'comptableDashboard' ],
            'comptable_caisse': [ 'comptableDashboard' ],
            'comptable_od': [ 'comptableDashboard' ]
        };

        // Afficher les sections principales
        (showSections[ role ] || []).forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'block';
        });

        // Afficher les sous-sections spécifiques pour les comptables
        if (role === 'comptable_banque') {
            document.querySelectorAll('.comptable_banque-only').forEach(el => {
                el.style.display = 'block';
            });
        } else if (role === 'comptable_caisse') {
            document.querySelectorAll('.comptable_caisse-only').forEach(el => {
                el.style.display = 'block';
            });
        } else if (role === 'comptable_od') {
            document.querySelectorAll('.comptable_od-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    }

    // Fonction utilitaire pour mettre à jour les éléments du DOM
    function updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = Utils.formatNumber(value);
            console.log(`${ elementId } mis à jour:`, value);
        } else {
            console.warn(`Élément non trouvé: ${ elementId }`);
        }
    }

    // Chargement initial
    loadStatistics();
    updateDashboardVisibility(userRole);

    // Actualisation périodique
    setInterval(loadStatistics, CONFIG.REFRESH_INTERVAL || 300000);

    // Gestion de la déconnexion
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        Utils.clearStorage();
        Utils.redirect('index.html');
    });
});