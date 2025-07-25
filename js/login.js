document.addEventListener("DOMContentLoaded", function () {
    console.log("Vérification de connexion...");

    // Vérifier si l'utilisateur est déjà connecté
    if (localStorage.getItem("role")) {
        console.log("Utilisateur déjà connecté, redirection vers dashboard.html");
        window.location.href = "dashboard.html";
    }

    // Fonction pour basculer la visibilité du mot de passe
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        // Basculer entre type "password" et "text"
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        // Changer l'icône en fonction de l'état
        this.classList.toggle('bi-eye');
        this.classList.toggle('bi-eye-slash');
    });

    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let message = document.getElementById("message");

        fetch("http://localhost/compte_na_biso/api/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Réponse API :", data);

                if (data.message === "Connexion réussie") {
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("email", email);
                    localStorage.setItem("nom", data.nom);
                    console.log("Utilisateur connecté :", data.nom, "Rôle :", data.role);
                    window.location.href = "dashboard.html";
                } else {
                    message.innerText = data.error;
                }
            })
            .catch(error => console.error("Erreur :", error));
    });

    // Gestion du thème clair/sombre
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Charger le thème sauvegardé
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="bi bi-sun"></i> Mode clair';
    }

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="bi bi-sun"></i> Mode clair';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="bi bi-moon"></i> Mode sombre';
        }
    });
});
