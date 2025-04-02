document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Vérification de session
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

        // 3. Cache tous les éléments protégés initialement
        const protectedElements = document.querySelectorAll('[class$="-only"]');
        protectedElements.forEach(el => el.style.display = 'none');

        // 4. Affiche les éléments autorisés
        const authorizedClasses = rolePermissions[ role ]?.map(r => `.${ r }-only`).join(', ');
        if (authorizedClasses) {
            document.querySelectorAll(authorizedClasses).forEach(el => {
                el.style.display = 'block';
            });
        }

        // 5. Gestion des rôles invalides
        if (!rolePermissions[ role ]) {
            console.warn("Rôle non reconnu :", role);
            redirectToLogin();
        }

    } catch (error) {
        console.error("Erreur:", error);
        redirectToLogin();
    }
});

function redirectToLogin() {
    // Ajout d'un message avant redirection (optionnel)
    sessionStorage.setItem('loginRedirectMessage', 'Session expirée ou non authentifiée');
    window.location.href = "index.html";
}