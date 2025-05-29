import { CONFIG, Utils } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // Récupérer les informations de l'utilisateur depuis le localStorage
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role');

    // Afficher le nom et le rôle
    document.getElementById('userName').textContent = userName || 'Utilisateur';
    document.getElementById('userRole').textContent = userRole || 'Non défini';

    // Fonction pour charger les statistiques
    async function loadStatistics() {
        try {
            const response = await fetch('http://localhost/compte_na_biso/api/statistics.php', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            // Mise à jour des statistiques admin
            if (data.admin) {
                document.getElementById('totalComptables').textContent = data.admin.totalComptables || 0;
                document.getElementById('totalEntreprises').textContent = data.admin.totalEntreprises || 0;
            }

            // Mise à jour des statistiques comptable
            if (data.comptable) {
                document.getElementById('totalOperationsJour').textContent = data.comptable.operationsJour || 0;
                document.getElementById('totalOperationsMois').textContent = data.comptable.operationsMois || 0;
            }

            // Mise à jour des statistiques chef comptable
            if (data.chefComptable) {
                document.getElementById('totalOpBanque').textContent = data.chefComptable.opBanque || 0;
                document.getElementById('totalOpCaisse').textContent = data.chefComptable.opCaisse || 0;
                document.getElementById('totalOpDiverses').textContent = data.chefComptable.opDiverses || 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    // Charger les statistiques au chargement de la page
    loadStatistics();

    // Actualiser les statistiques toutes les 5 minutes
    setInterval(loadStatistics, 300000);

    // Déconnexion
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("role");
        window.location.href = "index.html";
    });
});
