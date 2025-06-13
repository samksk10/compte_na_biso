const Utils = {
    /**
     * Gestion du stockage local
     */
    setInStorage: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    getFromStorage: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },

    clearStorage: () => {
        localStorage.clear();
    },

    /**
     * Navigation
     */
    redirect: (page) => {
        window.location.href = page;
    },

    /**
     * Gestion des messages
     */
    showError: (message, error) => {
        console.error(message, error);
        // Afficher le message d'erreur dans l'interface
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert alert-danger">
                    ${ message }: ${ error.message || 'Erreur inconnue' }
                </div>
            `;
            setTimeout(() => messageContainer.innerHTML = '', 5000);
        }
    },

    /**
     * Formatage des données
     */
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('fr-FR');
    },

    formatMontant: (montant) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(montant);
    }
};