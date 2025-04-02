// Fonction pour vérifier le rôle de l'utilisateur et restreindre l'accès
function checkUserRole() {
    const role = localStorage.getItem("role"); // Récupère le rôle de l'utilisateur
    const userNom = localStorage.getItem("nom"); // Récupère le nom de l'utilisateur

    // Affiche le nom et le rôle de l'utilisateur
    document.getElementById("userNom").innerText = userNom || "Utilisateur";
    document.getElementById("userRole").innerText = role || "Rôle inconnu";

    // Masque ou affiche les éléments en fonction du rôle
    const superAdminOnlyElements = document.querySelectorAll(".super_admin-only");
    const adminOnlyElements = document.querySelectorAll(".admin-only");

    if (role === "super_admin") {
        // Affiche tous les éléments pour le super administrateur
        superAdminOnlyElements.forEach(element => element.style.display = "block");
        adminOnlyElements.forEach(element => element.style.display = "block");
    } else if (role === "admin") {
        // Masque les éléments réservés au super administrateur
        superAdminOnlyElements.forEach(element => element.style.display = "none");
        adminOnlyElements.forEach(element => element.style.display = "block");
    } else {
        // Masque tous les éléments réservés aux administrateurs
        superAdminOnlyElements.forEach(element => element.style.display = "none");
        adminOnlyElements.forEach(element => element.style.display = "none");
    }
}

// Fonction pour gérer la déconnexion
function setupLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Empêche le comportement par défaut du lien
            localStorage.clear(); // Efface les données de localStorage
            window.location.href = "index.html"; // Redirige vers la page de connexion
        });
    }
}

// Vérifie le rôle de l'utilisateur au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    checkUserRole();
    setupLogoutButton();
});
