(async () => {
  // Récupération du token (reprise de la logique de getToken si nécessaire)

  let allCommandes = [];
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("X-AUTH-TOKEN", getToken());

  // Récupération des commandes
  async function fetchCommandes() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/commande", {
        method: "GET",
        headers: myHeaders,
      });

      if (!response.ok)
        throw new Error("Erreur lors de la récupération des commandes");

      allCommandes = await response.json();
      afficherCommandes(allCommandes);
    } catch (error) {
      console.error("Erreur :", error);
      const container =
        document.getElementById("commandes-container") ||
        document.getElementById("commandes-list");
      if (container) {
        container.innerHTML = `<p class="text-white-50 text-center">Impossible de charger vos commandes.</p>`;
      }
    }
  }

  // Affichage des cartes de commandes
  function afficherCommandes(commandes) {
    const wrapper =
      document.getElementById("commandes-container") ||
      document.getElementById("commandes-list");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    if (commandes.length === 0) {
      wrapper.innerHTML = `<p class="text-white-50 text-center">Vous n'avez passé aucune commande pour le moment.</p>`;
      return;
    }

    commandes.forEach((cmd) => {
      const menu = cmd.Menu || cmd.menu;
      const menuTitre = menu ? menu.titre : "Menu non renseigné";

      const datePrestation = cmd.date_prestation
        ? new Date(cmd.date_prestation).toLocaleDateString("fr-FR")
        : "N/A";

      const total = (
        parseFloat(cmd.prix_menu || 0) + parseFloat(cmd.prix_livraison || 0)
      ).toFixed(2);
      const statut = cmd.statut || "en attente";

      wrapper.insertAdjacentHTML(
        "beforeend",
        `
                <div class="commande-card mb-3 p-3 text-white bg-dark rounded border border-secondary">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0 text-black badge bg-warning">Commande n° ${cmd.numero_commande}</h5>
                        <span class="badge bg-success">${statut}</span>
                    </div>
                    <p class="mb-1"><strong>Menu :</strong> ${menuTitre}</p>
                    <p class="mb-1"><strong>Livraison :</strong> Le ${datePrestation} à ${cmd.heure_livraison || "12:00"}</p>
                    <p class="mb-1"><strong>Couverts :</strong> ${cmd.nombre_personne} personnes</p>
                    <p class="mb-1"><strong>Matériel :</strong> ${cmd.pret_materiel ? "Prêt de matériel demandé" : "Sans prêt"}</p>
                    <hr class="border-secondary" />
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-white-50 badge bg-black">Frais de livraison : ${parseFloat(cmd.prix_livraison) > 0 ? cmd.prix_livraison + " €" : "Offerts"}</small>
                        <h5 class="mb-0 badge text-black bg-secondary">Total : ${total} €</h5>
                    </div>
                </div>
            `,
      );
    });
  }

  // Lancement de la requête au chargement
  fetchCommandes();
})();
