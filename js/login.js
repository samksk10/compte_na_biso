document.addEventListener("DOMContentLoaded", function () {
    console.log("Vérification de connexion...");

    // Vérifier si l'utilisateur est déjà connecté
    if (localStorage.getItem("role")) {
        console.log("Utilisateur déjà connecté, redirection vers accueil.html");
        window.location.href = "accueil.html";
    }

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
                    window.location.href = "accueil.html";
                } else {
                    message.innerText = data.error;
                }
            })
            .catch(error => console.error("Erreur :", error));
    });
});
