(async () => {
  const token = typeof getToken === "function" ? getToken() : "";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AUTH-TOKEN": token,
  };

  
  // 1. GESTION DES ONGLETS & PANES
  

  // Navigation Principale
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-tab]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.getElementById("tab-commandes")?.classList.add("d-none");
      document.getElementById("tab-avis")?.classList.add("d-none");
      document.getElementById("tab-carte")?.classList.add("d-none");

      const targetTab = document.getElementById(`tab-${btn.dataset.tab}`);
      if (targetTab) targetTab.classList.remove("d-none");
    });
  });

  // Navigation Sous-onglets Carte
  document.querySelectorAll("[data-carte-pane]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-carte-pane]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.getElementById("pane-menus")?.classList.add("d-none");
      document.getElementById("pane-plats")?.classList.add("d-none");
      document
        .getElementById("pane-regimes-allergenes")
        ?.classList.add("d-none");

      const targetPane = document.getElementById(
        `pane-${btn.dataset.cartePane}`,
      );
      if (targetPane) targetPane.classList.remove("d-none");
    });
  });

  
  // 2. MODULE COMMANDES
  
  let rawCommandes = [];
  let modalCommandeInstance = null;

  const modalCmdEl = document.getElementById("modalCommandeDetails");
  if (modalCmdEl && typeof bootstrap !== "undefined") {
    modalCommandeInstance = new bootstrap.Modal(modalCmdEl);
  }

  async function fetchCommandes() {
    const container = document.getElementById("commandes-container");
    if (!container) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/employe/commandes",
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const data = await response.json();
      rawCommandes = data["hydra:member"] ?? data;

      applyFiltersAndRender();
    } catch (e) {
      console.error(e);
      container.innerHTML =
        "<p class='text-danger py-3'>Erreur lors du chargement des commandes.</p>";
    }
  }

  function applyFiltersAndRender() {
    const container = document.getElementById("commandes-container");
    if (!container) return;

    const selectedStatut =
      document.getElementById("filter-statut")?.value.toLowerCase() || "";
    const searchUser =
      document.getElementById("filter-user")?.value.toLowerCase().trim() || "";

    const filteredCommandes = rawCommandes.filter((cmd) => {
      const matchStatut =
        !selectedStatut ||
        (cmd.statut && cmd.statut.toLowerCase().includes(selectedStatut));

      const email = cmd.user?.email?.toLowerCase() || "";
      const prenom = cmd.user?.prenom?.toLowerCase() || "";
      const numCmd = cmd.numero_commande?.toLowerCase() || "";

      const matchUser =
        !searchUser ||
        email.includes(searchUser) ||
        prenom.includes(searchUser) ||
        numCmd.includes(searchUser);

      return matchStatut && matchUser;
    });

    if (filteredCommandes.length === 0) {
      container.innerHTML =
        "<p class='text-muted py-3'>Aucune commande ne correspond aux critères.</p>";
      return;
    }

    renderTable(filteredCommandes);
  }

  function renderTable(commandes) {
    const container = document.getElementById("commandes-container");
    container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>N° Commande</th>
                            <th>Client</th>
                            <th>Menu</th>
                            <th>Prestation</th>
                            <th>Prix Total</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${commandes
                          .map((cmd) => {
                            const prixTotal = (
                              parseFloat(cmd.prix_menu || 0) +
                              parseFloat(cmd.prix_livraison || 0)
                            ).toFixed(2);
                            const datePrestation = cmd.date_prestation
                              ? new Date(
                                  cmd.date_prestation,
                                ).toLocaleDateString("fr-FR")
                              : "—";

                            return `
                                <tr>
                                    <td class="fw-bold">${cmd.numero_commande ?? "—"}</td>
                                    <td>
                                        <div>${cmd.user?.prenom ?? "—"}</div>
                                        <small class="text-muted">${cmd.user?.email ?? ""}</small>
                                    </td>
                                    <td>${cmd.Menu?.titre ?? "—"}</td>
                                    <td>${datePrestation} à ${cmd.heure_livraison ?? "—"}</td>
                                    <td class="fw-bold text-primary">${prixTotal} €</td>
                                    <td>${getStatutBadge(cmd.statut)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="openDetailsModal(${cmd.id})">
                                            Gérer
                                        </button>
                                    </td>
                                </tr>
                            `;
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  window.openDetailsModal = (id) => {
    const cmd = rawCommandes.find((c) => c.id === id);
    if (!cmd) return;

    document.getElementById("md-error")?.classList.add("d-none");
    document.getElementById("md-success")?.classList.add("d-none");

    document.getElementById("md-cmd-id").value = cmd.id;
    document.getElementById("md-numero").textContent =
      cmd.numero_commande ?? "";
    document.getElementById("md-client-nom").textContent =
      `Client : ${cmd.user?.prenom ?? "—"}`;
    document.getElementById("md-client-email").textContent =
      `Email : ${cmd.user?.email ?? "—"}`;
    document.getElementById("md-client-phone").textContent =
      `Tél : ${cmd.user?.telephone ?? "—"}`;
    document.getElementById("md-client-adresse").textContent =
      `Adresse : ${cmd.user?.adresse_postale ?? ""}, ${cmd.user?.ville ?? ""}`;

    document.getElementById("md-menu-titre").textContent =
      `Menu : ${cmd.Menu?.titre ?? "—"}`;
    document.getElementById("md-date-prestation").textContent =
      `Date : ${cmd.date_prestation ? new Date(cmd.date_prestation).toLocaleDateString("fr-FR") : "—"} à ${cmd.heure_livraison ?? ""}`;

    const total = (
      parseFloat(cmd.prix_menu || 0) + parseFloat(cmd.prix_livraison || 0)
    ).toFixed(2);
    document.getElementById("md-prix-total").textContent = `Total : ${total} €`;
    document.getElementById("md-materiel").textContent =
      `Matériel : ${cmd.pret_materiel ? (cmd.restitution_materiel ? "Restitué" : "À récupérer") : "Non requis"}`;

    const selectStatut = document.getElementById("md-select-statut");
    if (selectStatut) {
      selectStatut.value = cmd.statut ?? "en attente";
      toggleAnnulationFields(selectStatut.value);
    }

    document.getElementById("md-motif-annulation").value =
      cmd.motif_annulation ?? "";
    document.getElementById("md-mode-contact").value = cmd.mode_contact ?? "";

    modalCommandeInstance?.show();
  };

  function toggleAnnulationFields(statutValue) {
    const sectionAnnulation = document.getElementById("section-annulation");
    if (!sectionAnnulation) return;
    if (statutValue === "annulée" || statutValue === "annulee") {
      sectionAnnulation.classList.remove("d-none");
    } else {
      sectionAnnulation.classList.add("d-none");
    }
  }

  document
    .getElementById("md-select-statut")
    ?.addEventListener("change", (e) => {
      toggleAnnulationFields(e.target.value);
    });

  document
    .getElementById("form-update-statut")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("md-cmd-id").value;
      const statut = document.getElementById("md-select-statut").value;
      const errorEl = document.getElementById("md-error");
      const successEl = document.getElementById("md-success");

      errorEl?.classList.add("d-none");
      successEl?.classList.add("d-none");

      if (statut === "annulée" || statut === "annulee") {
        const motif = document
          .getElementById("md-motif-annulation")
          .value.trim();
        const contact = document.getElementById("md-mode-contact").value;

        if (!motif || !contact) {
          if (errorEl) {
            errorEl.textContent =
              "Veuillez renseigner le motif d'annulation et le mode de contact.";
            errorEl.classList.remove("d-none");
          }
          return;
        }

        body.motif_annulation = motif;
        body.mode_contact = contact;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/employe/commandes/${id}/statut`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
          },
        );

        if (response.ok) {
          if (successEl) {
            successEl.textContent = "Statut mis à jour avec succès !";
            successEl.classList.remove("d-none");
          }
          setTimeout(() => {
            modalCommandeInstance?.hide();
            fetchCommandes();
          }, 1000);
        } else {
          const errData = await response.json();
          if (errorEl) {
            errorEl.textContent =
              errData.detail ??
              errData.message ??
              "Erreur lors de la mise à jour.";
            errorEl.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error(err);
        if (errorEl) {
          errorEl.textContent = "Erreur de connexion avec le serveur.";
          errorEl.classList.remove("d-none");
        }
      }
    });

  function getStatutBadge(statut) {
    if (!statut) return `<span class="badge bg-secondary">—</span>`;
    const st = statut.toLowerCase();
    if (st.includes("attente"))
      return `<span class="badge bg-warning text-dark">En attente</span>`;
    if (st.includes("valid"))
      return `<span class="badge bg-success">Validée</span>`;
    if (st.includes("annul"))
      return `<span class="badge bg-danger">Annulée</span>`;
    if (st.includes("termin"))
      return `<span class="badge bg-secondary">Terminée</span>`;
    return `<span class="badge bg-info">${statut}</span>`;
  }

  // Filtres
  document
    .getElementById("filter-statut")
    ?.addEventListener("change", applyFiltersAndRender);
  document
    .getElementById("filter-user")
    ?.addEventListener("input", applyFiltersAndRender);
  document
    .getElementById("btn-reset-filters")
    ?.addEventListener("click", () => {
      const selectStatut = document.getElementById("filter-statut");
      const inputUser = document.getElementById("filter-user");
      if (selectStatut) selectStatut.value = "";
      if (inputUser) inputUser.value = "";
      applyFiltersAndRender();
    });

  
  // 3. MODULE AVIS
  
  let rawAvis = [];
  let modalAvisInstance = null;

  const modalAvisEl = document.getElementById("modalAvisDetails");
  if (modalAvisEl && typeof bootstrap !== "undefined") {
    modalAvisInstance = new bootstrap.Modal(modalAvisEl);
  }

  async function fetchAvis() {
    const container = document.getElementById("avis-container");
    if (!container) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/avis", {
        method: "GET",
        headers,
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const data = await response.json();
      rawAvis = data["hydra:member"] ?? data;

      renderAvisTable(rawAvis);
    } catch (e) {
      console.error(e);
      container.innerHTML =
        "<p class='text-danger py-3'>Erreur lors du chargement des avis.</p>";
    }
  }

  function renderAvisTable(avisList) {
    const container = document.getElementById("avis-container");
    if (!container) return;

    if (avisList.length === 0) {
      container.innerHTML =
        "<p class='text-muted py-3'>Aucun avis à afficher.</p>";
      return;
    }

    container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>N°</th>
                            <th>Auteur / Email</th>
                            <th>Note</th>
                            <th>Commentaire</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${avisList
                          .map((a) => {
                            const noteStars =
                              "★".repeat(a.note || 0) +
                              "☆".repeat(Math.max(0, 5 - (a.note || 0)));
                            const descriptionCourte =
                              a.description && a.description.length > 50
                                ? a.description.substring(0, 50) + "..."
                                : a.description || "—";

                            return `
                                <tr>
                                    <td class="fw-bold">#${a.id}</td>
                                    <td>
                                        <div>${a.user?.prenom ?? a.nom_auteur ?? "Anonyme"}</div>
                                        <small class="text-muted">${a.user?.email ?? ""}</small>
                                    </td>
                                    <td class="text-warning fw-bold" title="${a.note}/5">${noteStars}</td>
                                    <td>${descriptionCourte}</td>
                                    <td>${getAvisStatutBadge(a.statut)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="openAvisModal(${a.id})">
                                            Modérer
                                        </button>
                                    </td>
                                </tr>
                            `;
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  window.openAvisModal = (id) => {
    const avisItem = rawAvis.find((a) => a.id === id);
    if (!avisItem) return;

    document.getElementById("md-avis-error")?.classList.add("d-none");
    document.getElementById("md-avis-success")?.classList.add("d-none");

    document.getElementById("md-input-avis-id").value = avisItem.id;
    document.getElementById("md-avis-id").textContent = avisItem.id;
    document.getElementById("md-avis-auteur").textContent =
      avisItem.user?.prenom ?? avisItem.nom_auteur ?? "Client";
    document.getElementById("md-avis-note").textContent =
      `${avisItem.note ?? 0} / 5 ★`;
    document.getElementById("md-avis-description").textContent =
      avisItem.description ?? "Pas de commentaire.";
    document.getElementById("md-avis-date").textContent = avisItem.createdAt
      ? `Déposé le ${new Date(avisItem.createdAt).toLocaleDateString("fr-FR")}`
      : "";

    const selectStatut = document.getElementById("md-select-avis-statut");
    if (selectStatut) selectStatut.value = avisItem.statut ?? "en_attente";

    modalAvisInstance?.show();
  };

  document
    .getElementById("form-update-avis")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("md-input-avis-id").value;
      const statut = document.getElementById("md-select-avis-statut").value;
      const errorEl = document.getElementById("md-avis-error");
      const successEl = document.getElementById("md-avis-success");

      errorEl?.classList.add("d-none");
      successEl?.classList.add("d-none");

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/avis/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ statut }),
        });

        if (response.ok) {
          if (successEl) {
            successEl.textContent =
              "Le statut de l'avis a bien été mis à jour !";
            successEl.classList.remove("d-none");
          }
          setTimeout(() => {
            modalAvisInstance?.hide();
            fetchAvis();
          }, 1000);
        } else {
          const errData = await response.json();
          if (errorEl) {
            errorEl.textContent =
              errData.detail ??
              errData.message ??
              "Erreur lors de la modération.";
            errorEl.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error(err);
        if (errorEl) {
          errorEl.textContent = "Erreur de connexion avec le serveur.";
          errorEl.classList.remove("d-none");
        }
      }
    });

  function getAvisStatutBadge(statut) {
    if (!statut) return `<span class="badge bg-secondary">Inconnu</span>`;
    const st = statut.toLowerCase();
    if (st.includes("valide") || st.includes("publie"))
      return `<span class="badge bg-success">Publié</span>`;
    if (st.includes("refus") || st.includes("masque"))
      return `<span class="badge bg-danger">Refusé</span>`;
    return `<span class="badge bg-warning text-dark">En attente</span>`;
  }

  
  // 4. MODULE MENUS
  
  async function loadMenus() {
    const container = document.getElementById("carte-menus-container");
    const countBadge = document.getElementById("count-menus");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/menu", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Erreur HTTP " + response.status);
      }

      const data = await response.json();
      const menus = data["hydra:member"] ?? data;
      rawMenus = menus;

      // Mettre à jour le compteur dans l'onglet
      if (countBadge)
        countBadge.textContent = Array.isArray(menus) ? menus.length : 0;

      // Si aucun menu n'est renvoyé
      if (!container) return;
      if (!Array.isArray(menus) || menus.length === 0) {
        container.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">
                            Aucun menu enregistré en base de données.
                        </td>
                    </tr>`;
        return;
      }

      // Générer les lignes HTML du tableau
      container.innerHTML = await Promise.all(
        menus.map(async (menu) => {
          let imageSrc = "../images/entrepriseImg1.jpg";
          try {
            const imgResponse = await fetch(
              `http://127.0.0.1:8000/api/image-menu/menu/${menu.id}`,
              { method: "GET", headers },
            );
            if (imgResponse.ok) {
              const images = await imgResponse.json();
              if (images[0]?.chemin) {
                imageSrc = `http://127.0.0.1:8000/uploads/menus/${images[0].chemin}`;
              }
            }
          } catch (e) {}

          const platsBadges =
            menu.plats && menu.plats.length > 0
              ? menu.plats
                  .map(
                    (p) =>
                      `<span class="badge bg-light text-dark border me-1">${p.titre_plat ?? p.titre}</span>`,
                  )
                  .join("")
              : '<em class="text-muted small">Aucun plat associé</em>';

          return `
        <tr>
            <td>
                <img src="${imageSrc}" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;" alt="${menu.titre}">
            </td>
            <td><span class="fw-bold d-block">${menu.titre}</span></td>
            <td><span class="badge bg-secondary">${menu.regime ?? "Non spécifié"}</span></td>
            <td>${platsBadges}</td>
            <td class="fw-bold text-success">${Number(menu.prix_par_personne || 0).toFixed(2)} €</td>
            <td>
                <span class="badge ${menu.quantite_restante > 5 ? "bg-success" : "bg-danger"}">
                    ${menu.quantite_restante ?? 0} dispo
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditMenuModal(${menu.id})">Éditer</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMenu(${menu.id})">Supprimer</button>
            </td>
        </tr>
    `;
        }),
      ).then((rows) => rows.join(""));
    } catch (error) {
      console.error("Erreur lors du chargement des menus :", error);
      if (container) {
        container.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger py-4">
                            Impossible de charger la liste des menus depuis le serveur.
                        </td>
                    </tr>`;
      }
    }
  }

  
  // MODULE PLATS
  
  let rawPlats = [];

  async function loadPlats() {
    const container = document.getElementById("carte-plats-container");
    const countBadge = document.getElementById("count-plats");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/plat", {
        method: "GET",
        headers,
      });

      if (!response.ok) throw new Error("Erreur HTTP " + response.status);

      const data = await response.json();
      rawPlats = data["hydra:member"] ?? data;

      if (countBadge) countBadge.textContent = rawPlats.length;

      if (!container) return;

      if (rawPlats.length === 0) {
        container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        Aucun plat enregistré.
                    </td>
                </tr>`;
        return;
      }
      const imgSrc = "../images/entrepriseImg1.jpg";
      container.innerHTML = rawPlats
        .map((plat) => {
          const allergenes =
            plat.allergenes?.length > 0
              ? plat.allergenes
                  .map(
                    (a) =>
                      `<span class="badge bg-danger me-1">${a.libelle}</span>`,
                  )
                  .join("")
              : '<em class="text-muted small">Aucun</em>';

          return `
                <tr>
                    <td>
                        <img src="imgSrc" 
                             class="rounded border" 
                             style="width: 50px; height: 50px; object-fit: cover;" 
                             alt="${plat.titre_plat}"
                             onerror="this.src='../images/entrepriseImg1.jpg'">
                    </td>
                    <td class="fw-bold">${plat.titre_plat}</td>
                    <td><span class="badge bg-primary">${plat.type ?? "—"}</span></td>
                    <td>${allergenes}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditPlatModal(${plat.id})">
                            Éditer
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePlat(${plat.id})">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");

      // Remplir aussi le select des plats dans la modale menu
      const selectPlats = document.getElementById("menu-plats");
      if (selectPlats) {
        selectPlats.innerHTML = rawPlats
          .map(
            (p) =>
              `<option value="${p.id}">${p.titre_plat} (${p.type ?? "—"})</option>`,
          )
          .join("");
      }
    } catch (error) {
      console.error("Erreur plats :", error);
      if (container) {
        container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-4">
                        Impossible de charger les plats.
                    </td>
                </tr>`;
      }
    }
  }

  window.openEditPlatModal = (id = null) => {
    document.getElementById("plat-id").value = "";
    document.getElementById("form-plat")?.reset();

    // Remplir le select allergènes
    const selectAllergenes = document.getElementById("plat-allergenes");
    if (selectAllergenes) {
      // À compléter 
    }

    if (id) {
      const plat = rawPlats.find((p) => p.id === id);
      if (plat) {
        document.getElementById("plat-id").value = plat.id;
        document.getElementById("plat-titre").value = plat.titre_plat ?? "";
        document.getElementById("plat-type").value = plat.type ?? "Plat";
        document.getElementById("plat-description").value =
          plat.description ?? "";
        document.getElementById("plat-photo").value = plat.photo ?? "";
      }
    }

    const modalPlatEl = document.getElementById("modalPlat");
    if (modalPlatEl) new bootstrap.Modal(modalPlatEl).show();
  };

  window.deletePlat = async (id) => {
    if (!confirm("Supprimer ce plat ?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/plat/${id}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok || response.status === 204) {
        loadPlats();
      } else {
        alert("Impossible de supprimer ce plat.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  document
    .getElementById("form-plat")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("plat-id").value;
      const method = id ? "PUT" : "POST";
      const url = id
        ? `http://127.0.0.1:8000/api/plat/${id}`
        : "http://127.0.0.1:8000/api/plat";

      const body = {
        titre_plat: document.getElementById("plat-titre").value,
        type: document.getElementById("plat-type").value,
        description: document.getElementById("plat-description").value,
        photo: document.getElementById("plat-photo").value,
      };

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const modalPlatEl = document.getElementById("modalPlat");
          bootstrap.Modal.getInstance(modalPlatEl)?.hide();
          loadPlats();
        } else {
          const err = await response.json();
          alert(err.detail ?? "Erreur lors de l'enregistrement.");
        }
      } catch (e) {
        console.error(e);
      }
    });

 
  // MODALE MENU (Créer Éditer)

  let rawMenus = [];
  let modalMenuInstance = null;

  const modalMenuEl = document.getElementById("openEditMenuModal");
  if (modalMenuEl && typeof bootstrap !== "undefined") {
    modalMenuInstance = new bootstrap.Modal(modalMenuEl);
  }

  window.openEditMenuModal = async (id = null) => {
    document.getElementById("menu-id").value = "";
    document.getElementById("form-menu")?.reset();

    if (id) {
      // Mode édition pré-remplir le formulaire
      const menu = rawMenus.find((m) => m.id === id);
      if (menu) {
        document.getElementById("modalMenuTitle").textContent =
          "Modifier le menu";
        document.getElementById("menu-id").value = menu.id;
        document.getElementById("menu-titre").value = menu.titre ?? "";
        document.getElementById("menu-prix").value =
          menu.prix_par_personne ?? "";
        document.getElementById("menu-description").value =
          menu.description ?? "";
        document.getElementById("menu-quantite").value =
          menu.quantite_restante ?? "";
        document.getElementById("menu-min-pers").value =
          menu.nombre_personne_minimum ?? 1;
        document.getElementById("menu-temps-prep").value =
          menu.tempsPreparation ?? 30;
      }
    } else {
      document.getElementById("modalMenuTitle").textContent =
        "Créer un nouveau menu";
    }

    modalMenuInstance?.show();
  };

  window.deleteMenu = async (id) => {
    if (!confirm("Supprimer ce menu ?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/menu/${id}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok || response.status === 204) {
        loadMenus();
      } else {
        alert("Impossible de supprimer ce menu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  document
    .getElementById("form-menu")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("menu-id").value;
      const method = id ? "PUT" : "POST";
      const url = id
        ? `http://127.0.0.1:8000/api/menu/${id}`
        : "http://127.0.0.1:8000/api/menu";

      const menuBody = {
        titre: document.getElementById("menu-titre").value,
        prix_par_personne: parseFloat(
          document.getElementById("menu-prix").value,
        ),
        description: document.getElementById("menu-description").value,
        quantite_restante: parseInt(
          document.getElementById("menu-quantite").value,
        ),
        nombre_personne_minimum: parseInt(
          document.getElementById("menu-min-pers").value,
        ),
        plats: parseInt(document.getElementById("menu-plats").value),
        theme: parseInt(document.getElementById("menu-theme").value),
        temps_preparation_minimum: parseInt(
          document.getElementById("menu-temps-prep").value,
        ),
        regime: document.getElementById("menu-regime").value,
      };
      const regimeVal = document.getElementById("menu-regime")?.value;
      if (regimeVal) menuBody.regime = regimeVal;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/menu/${id}`, {
          method,
          headers,
          body: JSON.stringify(menuBody),
        });

        const menuCreé = await response.json();
        const menuId = menuCreé.id ?? id;

        // 2. Upload de l'image si un fichier est sélectionné
        const fileInput = document.getElementById("menu-image");
        if (fileInput?.files?.length > 0) {
          const formData = new FormData();
          formData.append("image", fileInput.files[0]);
          formData.append("menu_id", menuId);

          await fetch("http://127.0.0.1:8000/api/image-menu", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "X-AUTH-TOKEN": token,
            },
            body: formData,
          });
        }

        const modalMenuEl = document.getElementById("openEditMenuModal");
        bootstrap.Modal.getInstance(modalMenuEl)?.hide();
        loadMenus();
      } catch (e) {
        console.error(e);
      }
    });

  
  // 5. MODULE RÉGIMES & ALLERGÈNES
  
  let rawRegimes = [];
  let modalRegimeInstance = null;

  const modalRegimeEl = document.getElementById("modalRegime");
  if (modalRegimeEl && typeof bootstrap !== "undefined") {
    modalRegimeInstance = new bootstrap.Modal(modalRegimeEl);
  }

  async function fetchRegimes() {
    const container = document.getElementById("regimes-container");
    if (!container) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/regime", {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const data = await response.json();
      rawRegimes = data["hydra:member"] ?? data;

      renderRegimesTable(rawRegimes);
    } catch (e) {
      console.error(e);
      container.innerHTML =
        "<p class='text-danger py-3'>Erreur lors du chargement des régimes et allergènes.</p>";
    }
  }

  /*  async function fetchThemes() {
        const container = document.getElementById("menu-theme");
        if (!container) return;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/theme", {
                method: "GET",
                headers: headers
            });

            if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

            const data = await response.json();
            rawTheme = data["hydra:member"] ?? data;

            renderRegimesTable(rawTheme);
        } catch (e) {
            console.error(e);
            container.innerHTML = "<p class='text-danger py-3'>Erreur lors du chargement des thèmes et allergènes.</p>";
        }
    }*/

  function renderRegimesTable(list) {
    const container = document.getElementById("regimes-container");
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML =
        "<p class='text-muted py-3'>Aucun régime ou allergène enregistré.</p>";
      return;
    }

    container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list
                          .map(
                            (item) => `
                            <tr>
                                <td>${item.id}</td>
                                <td class="fw-bold">${item.nom ?? item.libelle ?? "—"}</td>
                                <td>
                                    <span class="badge ${item.type === "allergene" ? "bg-danger" : "bg-info"}">
                                        ${item.type === "allergene" ? "Allergène" : "Régime"}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning me-1" onclick="openRegimeModal(${item.id})">
                                        Éditer
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRegime(${item.id})">
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  window.openRegimeModal = (id = null) => {
    document.getElementById("regime-error")?.classList.add("d-none");

    if (id) {
      const item = rawRegimes.find((r) => r.id === id);
      if (!item) return;

      document.getElementById("modalRegimeTitle").textContent =
        "Modifier le régime / allergène";
      document.getElementById("regime-id").value = item.id;
      document.getElementById("regime-nom").value =
        item.nom ?? item.libelle ?? "";
      document.getElementById("regime-type").value = item.type ?? "regime";
    } else {
      document.getElementById("modalRegimeTitle").textContent =
        "Ajouter un régime / allergène";
      document.getElementById("form-regime")?.reset();
      document.getElementById("regime-id").value = "";
    }

    modalRegimeInstance?.show();
  };

  document
    .getElementById("form-regime")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("regime-id").value;
      const nom = document.getElementById("regime-nom").value.trim();
      const type = document.getElementById("regime-type").value;
      const errorEl = document.getElementById("regime-error");

      errorEl?.classList.add("d-none");

      const method = id ? "PUT" : "POST";
      const url = id
        ? `http://127.0.0.1:8000/api/regime/${id}`
        : "http://127.0.0.1:8000/api/regime";

      try {
        const response = await fetch(url, {
          method: method,
          headers: headers,
          body: JSON.stringify({ nom, type }),
        });

        if (response.ok) {
          modalRegimeInstance?.hide();
          fetchRegimes();
        } else {
          const errData = await response.json();
          if (errorEl) {
            errorEl.textContent =
              errData.detail ??
              errData.message ??
              "Erreur lors de l'enregistrement.";
            errorEl.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error(err);
        if (errorEl) {
          errorEl.textContent = "Erreur de connexion au serveur.";
          errorEl.classList.remove("d-none");
        }
      }
    });

  window.deleteRegime = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/regime/${id}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok || response.status === 204) {
        fetchRegimes();
      } else {
        alert("Impossible de supprimer cet élément.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion.");
    }
  };

  async function loadRegimesSelect() {
    const select = document.getElementById("menu-regime");
    if (!select) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/regime", {
        method: "GET",
        headers,
      });

      if (!response.ok) return;

      const data = await response.json();
      const regimes = data["hydra:member"] ?? data;

      // Option vide — optionnel
      select.innerHTML = `<option value="">-- Aucun régime --</option>`;
      regimes.forEach((r) => {
        select.innerHTML += `<option value="${r.libelle}">${r.libelle}</option>`;
      });
    } catch (e) {
      console.error("Erreur régimes :", e);
    }
  }
  
  // INITIALISATION & CHARGEMENT INITIAL
  
  fetchCommandes();
  fetchAvis();
  loadMenus();
  loadPlats();
  fetchRegimes();
  loadRegimesSelect();
})();
