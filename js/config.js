export const CONFIG = {
    // Configuration de l'API
    API: {
        BASE_URL: 'http://localhost/compte_na_biso/api',
        ENDPOINTS: {
            // Fichiers PHP existants uniquement
            CHECK_SESSION: '/check_session.php',
            CATEGORIES_JOURNAUX: 'categoriesjournaux.php',
            COMPTABLES: 'comptables.php',
            ENREGISTRER_BANQUE: 'enregistrerBanque.php',
            ENTREPRISE: 'entreprise.php',
            JOURNAL: 'journal.php',
            LISTER: 'lister.php',
            LOGIN: 'login.php',
            LOGOUT: 'logout.php',
            PLANCOMPTABLE: 'plancomptable.php',
            REGISTER: 'register.php',
            STATS: 'stats.php',
            TAUXCHANGE: 'tauxchange.php'

        }
    },

    // Configuration des rôles et permissions
    ROLES: {
        // Hiérarchie des permissions par rôle
        PERMISSIONS: {
            super_admin: [ "super_admin", "admin", "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            admin: [ "admin", "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            chef_comptable: [ "chef_comptable", "comptable_caisse", "comptable_banque", "comptable_od" ],
            comptable_caisse: [ "comptable_caisse" ],
            comptable_banque: [ "comptable_banque" ],
            comptable_od: [ "comptable_od" ]
        },

        // Noms d'affichage des rôles
        DISPLAY_NAMES: {
            super_admin: "Super Administrateur",
            admin: "Administrateur",
            chef_comptable: "Chef Comptable",
            comptable_caisse: "Comptable Caisse",
            comptable_banque: "Comptable Banque",
            comptable_od: "Comptable Des Opérations Diverses"
        }
    },

    // Configuration des permissions par page
    PAGES: {
        PERMISSIONS: {
            'register.html': [ 'super_admin' ],
            'comptables.html': [ 'super_admin', 'admin' ],
            'entreprise.html': [ 'super_admin', 'admin' ],
            'categoriesjournaux.html': [ 'super_admin', 'admin' ],
            'listerCategoriesJournaux.html': [ 'super_admin', 'admin' ],
            'listerComptables.html': [ 'super_admin', 'admin' ],
            'journalBanque.html': [ 'comptable_banque', 'chef_comptable' ],
            'journalCaisse.html': [ 'comptable_caisse', 'chef_comptable' ],
            'journalOperations.html': [ 'comptable_od', 'chef_comptable' ]
        }
    },

    // Configuration des messages
    MESSAGES: {
        ERRORS: {
            SESSION: "Session expirée ou invalide",
            ROLE: "Rôle non reconnu",
            ACCESS_DENIED: "Accès non autorisé à cette page",
            SERVER: "Erreur serveur",
            JSON: "Réponse serveur invalide (JSON)"
        }
    },

    // Configuration des requêtes fetch
    FETCH_OPTIONS: {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        }
    }
};

// Fonctions utilitaires
export const Utils = {
    buildApiUrl(endpoint) {
        return `${ CONFIG.API.BASE_URL }${ CONFIG.API.ENDPOINTS[ endpoint ] }`;
    },

    getRoleDisplay(role) {
        return CONFIG.ROLES.DISPLAY_NAMES[ role ] || role;
    },

    checkPagePermission(currentPage, userRole) {
        const allowedRoles = CONFIG.PAGES.PERMISSIONS[ currentPage ];
        return !allowedRoles || allowedRoles.includes(userRole);
    },

    hasPermission(userRole, requiredRole) {
        return CONFIG.ROLES.PERMISSIONS[ userRole ]?.includes(requiredRole) || false;
    }
};