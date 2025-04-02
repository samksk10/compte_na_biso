document.addEventListener("DOMContentLoaded", function () {
    let userRole = localStorage.getItem("role");

    if (!userRole) {
        window.location.href = "index.html";
    } else {
        document.getElementById("userRole").innerText = userRole;
    }

    // Charger les statistiques
    fetch("http://localhost/compte_na_biso/api/stats.php")
        .then(response => response.json())
        .then(data => {
            document.getElementById("totalDebit").innerText = data.total_debit || 0;
            document.getElementById("totalCredit").innerText = data.total_credit || 0;
        })
        .catch(error => console.error("Erreur stats :", error));

    // Charger les dernières opérations
    fetch("http://localhost/compte_na_biso/api/last_operations.php")
        .then(response => response.json())
        .then(data => {
            let operationsTable = document.getElementById("operationsTable");
            operationsTable.innerHTML = ""; // Vider le tableau

            data.forEach(op => {
                let row = `<tr>
                    <td>${ op.T8_Libelle }</td>
                    <td>${ op.T8_DMontant } CDF</td>
                    <td>${ op.T8_CMontant } CDF</td>
                </tr>`;
                operationsTable.innerHTML += row;
            });
        })
        .catch(error => console.error("Erreur opérations :", error));

    // Déconnexion
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("role");
        window.location.href = "index.html";
    });
});
