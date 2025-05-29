document.addEventListener("DOMContentLoaded", function () {
    let userRole = localStorage.getItem("role"); // Récupérer le rôle de l'utilisateur connecté

    // Vérifier si l'utilisateur est Super Admin, sinon rediriger
    if (userRole !== "super_admin") {
        alert("Accès refusé ! Seul le super administrateur peut ajouter un administrateur.");
        window.location.href = "dashboard.html";
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

    // Déclarer les fonctions globalement
    window.editAdmin = function (id) {
        fetch(`http://localhost/compte_na_biso/api/register.php?id=${ id }`)
            .then(response => response.json())
            .then(admin => {
                document.getElementById("nom").value = admin.nom;
                document.getElementById("email").value = admin.email;
                document.getElementById("password").value = ''; // Vider le champ password

                // Modifier le formulaire pour la mise à jour
                const form = document.getElementById("registerForm");
                form.dataset.editId = id;
                document.querySelector('button[type="submit"]').textContent = "Modifier";

                // Modifier l'action du formulaire
                form.onsubmit = function (e) {
                    e.preventDefault();
                    updateAdmin(id);
                };
            })
            .catch(error => console.error("Erreur :", error));
    };

    window.updateAdmin = function (id) {
        const formData = {
            id: id,
            nom: document.getElementById("nom").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: "admin"
        };

        fetch("http://localhost/compte_na_biso/api/register.php", {
            method: "PUT",
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
                    loadAdmins();
                    // Réinitialiser le formulaire pour l'ajout
                    const form = document.getElementById("registerForm");
                    form.removeAttribute("data-edit-id");
                    document.querySelector('button[type="submit"]').textContent = "Ajouter";
                } else {
                    document.getElementById("message").innerHTML = `<div class="alert alert-danger">${ data.error }</div>`;
                }
            })
            .catch(error => console.error("Erreur :", error));
    };

    window.deleteAdmin = function (id) {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) {
            fetch(`http://localhost/compte_na_biso/api/register.php?id=${ id }`, {
                method: "DELETE"
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        document.getElementById("message").innerHTML = `<div class="alert alert-success">${ data.message }</div>`;
                        loadAdmins();
                    } else {
                        document.getElementById("message").innerHTML = `<div class="alert alert-danger">${ data.error }</div>`;
                    }
                })
                .catch(error => console.error("Erreur :", error));
        }
    };

    // Fonction pour charger la liste des administrateurs
    window.loadAdmins = function () {
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
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editAdmin(${ admin.id })">Modifier</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteAdmin(${ admin.id })">Supprimer</button>
                        </td>
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
