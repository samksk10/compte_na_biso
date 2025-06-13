const Utils = {
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

    redirect: (page) => {
        window.location.href = page;
    },

    showError: (message, error) => {
        console.error(message, error);
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert alert-danger">
                    ${ message }: ${ error.message || 'Erreur inconnue' }
                </div>
            `;
            setTimeout(() => messageContainer.innerHTML = '', 5000);
        }
    }
};