document.addEventListener("DOMContentLoaded", function () {
    let userRole = localStorage.getItem("role"); // Récupérer le rôle de l'utilisateur connecté

    // Vérifier si l'utilisateur est Super Admin, sinon rediriger
    if (userRole !== "super_admin") {
        alert("Accès refusé ! Seul le super_admin peut ajouter un administrateur.");
        window.location.href = "accueil.html";
    }

    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = {
            nom: document.getElementById("nom").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: "admin" // Seul un admin peut être ajouté ici
        };

        fetch("http://localhost/compte_na_biso/api/register.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    document.getElementById("message").innerHTML = `<div class="alert alert-success">${ data.message }</div>`;
                    document.getElementById("registerForm").reset();
                    loadAdmins(); // Recharger la liste des admins
                } else {
                    document.getElementById("message").innerHTML = `<div class="alert alert-danger">${ data.error }</div>`;
                }
            })
            .catch(error => console.error("Erreur :", error));
    });

    // Fonction pour charger la liste des administrateurs
    function loadAdmins() {
        fetch("http://localhost/compte_na_biso/api/register.php")
            .then(response => response.json())
            .then(data => {
                let tableBody = document.getElementById("usersadminTable");
                tableBody.innerHTML = "";
                data.forEach(admin => {
                    let row = `<tr>
                    <td>${ admin.id }</td>
                    <td>${ admin.nom }</td>
                    <td>${ admin.email }</td>
                </tr>`;
                    tableBody.innerHTML += row;
                });
            })
            .catch(error => console.error("Erreur de chargement :", error));
    }
    // Gestion de la déconnexion
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "index.html";
    });

    loadAdmins(); // Charger la liste des administrateurs au chargement de la page
    setupLogoutButton();


});
