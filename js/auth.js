import { CONFIG, Utils } from './config.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // === 1. Vérifier la session via l'API ===
        const response = await fetch(Utils.buildApiUrl('CHECK_SESSION'), CONFIG.FETCH_OPTIONS);

        if (!response.ok) throw new Error(CONFIG.MESSAGES.ERRORS.SESSION);

        const data = await response.json();
        const { role, nom } = data;

        // === 2. Vérifier que le rôle est autorisé ===
        if (!CONFIG.ROLES.PERMISSIONS[ role ]) {
            console.warn(CONFIG.MESSAGES.ERRORS.ROLE, role);
            return redirectToLogin(CONFIG.MESSAGES.ERRORS.ROLE);
        }

        // === 3. Masquer puis afficher les éléments autorisés ===
        document.querySelectorAll('[class$="-only"]').forEach(el => el.style.display = 'none');

        const allowedClasses = CONFIG.ROLES.PERMISSIONS[ role ].map(r => `.${ r }-only`).join(', ');
        if (allowedClasses) {
            document.querySelectorAll(allowedClasses).forEach(el => {
                el.style.display = 'block';
            });
        }

        // === 4. Afficher nom et rôle dans l'en-tête ===
        const roleText = Utils.getRoleDisplay(role);

        if (document.getElementById("userNom")) {
            document.getElementById("userNom").textContent = nom || "";
        }
        if (document.getElementById("userRole")) {
            document.getElementById("userRole").textContent = roleText;
        }

        // === 5. Vérifier l'accès à la page selon le rôle ===
        const currentPage = window.location.pathname.split('/').pop();
        const pagePermissions = CONFIG.PAGES.PERMISSIONS;

        if (pagePermissions[ currentPage ] && !pagePermissions[ currentPage ].includes(role)) {
            return redirectTo("dashboard.html", CONFIG.MESSAGES.ERRORS.ACCESS);
        }

        // === 6. Déconnexion sécurisée ===
        document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.clear();
            try {
                await fetch(Utils.buildApiUrl('LOGOUT'), CONFIG.FETCH_OPTIONS);
            } catch (logoutError) {
                console.warn(CONFIG.MESSAGES.ERRORS.LOGOUT, logoutError);
            }
            redirectTo("index.html");
        });

    } catch (error) {
        console.error("Erreur :", error);
        redirectToLogin(CONFIG.MESSAGES.ERRORS.SESSION);
    }
});

// === Fonction de redirection sécurisée ===
function redirectTo(url, message = '') {
    if (message) sessionStorage.setItem('loginRedirectMessage', message);
    window.location.href = url;
}

function redirectToLogin(message = '') {
    redirectTo("index.html", message);
}
