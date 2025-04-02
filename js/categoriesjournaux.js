document.addEventListener("DOMContentLoaded", function () {
    const comptableSelect = document.getElementById("t4_comptable_id");
    const categoriesTableBody = document.getElementById("categoriesList");
    const formCategorie = document.getElementById("categorieForm");
    const messageDiv = document.getElementById("message");

    // ✅ Charger les comptables dans la liste déroulante
    function loadComptables() {
        fetch("http://localhost/compte_na_biso/api/comptables.php", {
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                comptableSelect.innerHTML = '<option value="">Sélectionner un comptable</option>';
                data.forEach(comptable => {
                    const option = document.createElement("option");
                    option.value = comptable.T4_NumComptable;
                    option.textContent = `${ comptable.T4_NomComptable } (${ comptable.T4_CodeComptable })`;
                    comptableSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Erreur :", error);
                alert("Erreur lors du chargement des comptables.");
            });
    }

    // ✅ Charger les catégories de journaux
    function loadCategories() {
        fetch("http://localhost/compte_na_biso/api/categoriesjournaux.php", {
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                categoriesTableBody.innerHTML = "";

                data.forEach(category => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${ category.T3_NumJournal }</td>
                        <td>${ category.T3_CodeJournal }</td>
                        <td>${ category.T3_NomJournal }</td>
                        <td>${ category.T4_NomComptable || "Non assigné" }</td>
                        <td>
                            <button class="btn btn-sm btn-primary me-2" onclick="editCategory(${ category.T3_NumJournal }, '${ category.T3_CodeJournal }', '${ category.T3_NomJournal }', ${ category.t4_comptable_id })">Modifier</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${ category.T3_NumJournal })">Supprimer</button>
                        </td>
                    `;

                    categoriesTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des catégories :", error);
                alert("Impossible de charger les catégories.");
            });
    }

    // ✅ Gérer l'ajout ou la mise à jour d'une catégorie
    formCategorie.addEventListener("submit", function (event) {
        event.preventDefault();

        const codeJournal = document.getElementById("T3_CodeJournal").value.trim();
        const nomJournal = document.getElementById("T3_NomJournal").value.trim();
        const comptableId = comptableSelect.value.trim();

        if (!codeJournal || !nomJournal || !comptableId) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const formData = {
            T3_CodeJournal: codeJournal,
            T3_NomJournal: nomJournal,
            t4_comptable_id: comptableId
        };

        let url = "http://localhost/compte_na_biso/api/categoriesjournaux.php";
        let method = "POST";

        if (formCategorie.getAttribute("data-mode") === "edit") {
            formData.T3_NumJournal = formCategorie.getAttribute("data-id");
            method = "PUT";
        }

        fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${ response.status }`);
                }
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    formCategorie.reset();
                    formCategorie.removeAttribute("data-mode");
                    formCategorie.removeAttribute("data-id");
                    document.querySelector("button[type='submit']").textContent = "Ajouter";
                    loadCategories();
                } else {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error("Erreur Fetch :", error);
                alert(`Erreur lors de l'enregistrement : ${ error.message }`);
            });
    });

    // ✅ Remplir le formulaire avec les données à modifier
    window.editCategory = function (id, code, nom, comptableId) {
        document.getElementById("T3_CodeJournal").value = code;
        document.getElementById("T3_NomJournal").value = nom;
        document.getElementById("t4_comptable_id").value = comptableId;

        formCategorie.setAttribute("data-mode", "edit");
        formCategorie.setAttribute("data-id", id);
        document.querySelector("button[type='submit']").textContent = "Mettre à jour";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ Supprimer une catégorie
    window.deleteCategory = function (id) {
        if (confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
            fetch("http://localhost/compte_na_biso/api/categoriesjournaux.php", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ T3_NumJournal: id })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP : ${ response.status }`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.message) {
                        alert(data.message);
                        loadCategories();
                    } else {
                        alert(data.error);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la suppression :", error);
                    alert(`Erreur lors de la suppression : ${ error.message }`);
                });
        }
    };
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

    // ✅ Charger les données au démarrage
    loadComptables();
    loadCategories();
    setupLogoutButton();
});