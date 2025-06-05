import { CONFIG, Utils } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // Définir le rôle sur le body
    const userRole = Utils.getFromStorage('role');
    document.body.setAttribute('data-role', userRole);

    // Afficher les informations utilisateur
    const userName = Utils.getFromStorage('userName');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');

    if (userNameElement) {
        userNameElement.textContent = userName || 'Utilisateur';
    }
    if (userRoleElement) {
        userRoleElement.textContent = userRole || 'Non défini';
    }

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Données brutes reçues:', data);

            // Afficher le rôle actuel
            console.log('Rôle actuel:', Utils.getFromStorage('role'));

            // Vérifier l'affichage pour super_admin
            if (data.super_admin) {
                console.log('Mise à jour stats super_admin');
                const adminCount = data.super_admin.totalAdministrateurs;
                const element = document.getElementById('totalAdministrateurs');
                if (element) {
                    element.textContent = adminCount;
                    console.log('totalAdministrateurs mis à jour:', adminCount);
                } else {
                    console.error("L'élément totalAdministrateurs n'existe pas");
                }
            }

            // Vérifier l'affichage pour admin
            if (data.admin) {
                console.log('Mise à jour stats admin');
                const adminStats = {
                    'totalComptables': data.admin.totalComptables,
                    'totalEntreprises': data.admin.totalEntreprises,
                    'totalChefsComptables': data.admin.totalChefsComptables
                };

                Object.entries(adminStats).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                        console.log(`${id} mis à jour:`, value);
                    } else {
                        console.error(`L'élément ${id} n'existe pas`);
                    }
                });
            }

        } catch (error) {
            console.error('Erreur détaillée:', error);
            Utils.showError('Erreur lors du chargement des statistiques:', error);
        }
    }

    // Charger les statistiques au chargement de la page
    loadStatistics();

    // Actualiser les statistiques selon la configuration
    setInterval(loadStatistics, CONFIG.REFRESH_INTERVAL || 300000);

    // Déconnexion avec Utils
    document.getElementById("logoutBtn").addEventListener("click", () => {
        Utils.clearStorage();
        Utils.redirect('index.html');
    });
});
