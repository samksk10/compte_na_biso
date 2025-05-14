import { CONFIG, Utils } from './config.js';

document.addEventListener('DOMContentLoaded', async function () {
    const userRole = localStorage.getItem("role");

    if (!userRole) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userRole").innerText = CONFIG.ROLES.DISPLAY_NAMES[ userRole ] || userRole;

    // Charger les statistiques
    try {
        const response = await fetch(Utils.buildApiUrl('STATS'), CONFIG.FETCH_OPTIONS);
        if (!response.ok) throw new Error('Erreur réseau');

        const stats = await response.json();
        updateDashboardStats(stats);
    } catch (error) {
        console.error('Erreur lors du chargement des stats :', error);
    }

    // Charger les dernières opérations
    try {
        const response = await fetch(`${ CONFIG.API.BASE_URL }/last_operations.php`);
        const data = await response.json();

        const operationsTable = document.getElementById("operationsTable");
        operationsTable.innerHTML = data.map(op => `
            <tr>
                <td>${ op.T8_Libelle }</td>
                <td>${ op.T8_DMontant } CDF</td>
                <td>${ op.T8_CMontant } CDF</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Erreur lors du chargement des opérations :", error);
    }

    // Déconnexion
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("role");
        window.location.href = "index.html";
    });
});

function updateDashboardStats(stats) {
    const ids = {
        totalComptables: stats.totalComptables,
        totalEntreprises: stats.totalEntreprises,
        totalOperationsJour: stats.operationsJour,
        totalOperationsMois: stats.operationsMois,
        totalOpBanque: stats.opBanque,
        totalOpCaisse: stats.opCaisse,
        totalOpDiverses: stats.opDiverses
    };

    for (const [ id, value ] of Object.entries(ids)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || 0;
    }
}
