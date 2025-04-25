document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Vérification de session via l'API
        const response = await fetch("http://localhost/compte_na_biso/api/check_session.php", {
            credentials: "include"
        });

        if (!response.ok) throw new Error("Erreur de session");

        const { role } = await response.json();
        console.log("Rôle détecté :", role);

        // 2. Définition des permissions par rôle
        const rolePermissions = {
            super_admin: [ "super_admin", "admin", "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            admin: [ "admin", "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            chef_comptable: [ "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            comptable_caisse: [ "comptable_caisse" ],
            comptable_banque: [ "comptable_banque" ],
            comptable_od: [ "comptable_od" ]
        };

        // 3. Cacher tous les éléments restreints au départ
        const protectedElements = document.querySelectorAll('[class$="-only"]');
        protectedElements.forEach(el => el.style.display = 'none');

        // 4. Afficher les éléments autorisés pour ce rôle
        const authorizedClasses = rolePermissions[ role ]?.map(r => `.${ r }-only`).join(', ');
        if (authorizedClasses) {
            document.querySelectorAll(authorizedClasses).forEach(el => {
                el.style.display = 'block';
            });
        }

        // 5. Affichage dynamique du nom et rôle dans la page (si présent)
        const nom = localStorage.getItem("nom");
        const roleText = {
            super_admin: "Super Administrateur",
            admin: "Administrateur",
            chef_comptable: "Chef Comptable",
            comptable_caisse: "Comptable Caisse",
            comptable_banque: "Comptable Banque",
            comptable_od: "Comptable Des Opérations Diverses"
        }[ role ];

        if (document.getElementById("userNom")) {
            document.getElementById("userNom").textContent = nom || "";
        }
        if (document.getElementById("userRole")) {
            document.getElementById("userRole").textContent = roleText || role;
        }

        // 6. Vérification de rôle valide
        if (!rolePermissions[ role ]) {
            console.warn("Rôle non reconnu :", role);
            redirectToLogin();
        }

        // 7. Gestion déconnexion
        document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear(); // Nettoyer le localStorage
            fetch("http://localhost/compte_na_biso/api/logout.php", {
                method: "POST",
                credentials: "include"
            }).finally(() => {
                window.location.href = "index.html";
            });
        });

    } catch (error) {
        console.error("Erreur:", error);
        redirectToLogin();
    }
});

function redirectToLogin() {
    sessionStorage.setItem('loginRedirectMessage', 'Session expirée ou non authentifiée');
    window.location.href = "index.html";
}
