(async () => {
  const token = typeof getToken === "function" ? getToken() : "";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AUTH-TOKEN": token,
  };

  // 1. GESTION DES ONGLETS & PANES
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
                  ? new Date(cmd.date_prestation).toLocaleDateString("fr-FR")
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

      const body = { statut };

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

  const modalAvisEl = document.getElementById("modalAvis");
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
  let rawMenus = [];

  async function loadMenus() {
    const container = document.getElementById("carte-menus-container");
    const countBadge = document.getElementById("count-menus");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/menu", {
        method: "GET",
        headers,
      });

      if (!response.ok) throw new Error("Erreur HTTP " + response.status);

      const data = await response.json();
      const menus = data["hydra:member"] ?? data;
      rawMenus = menus;

      if (countBadge)
        countBadge.textContent = Array.isArray(menus) ? menus.length : 0;

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

      container.innerHTML = await Promise.all(
        menus.map(async (menu) => {
          let imageSrc = "../images/entrepriseImg1.jpg";
          try {
            const imgResponse = await fetch(
              `http://127.0.0.1:8000/api/image-menu/menu/${menu.id}`,
              {
                method: "GET",
                headers,
              },
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

  async function loadThemesSelect() {
    const select = document.getElementById("menu-theme");
    if (!select) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/theme", { headers });
      const data = await res.json();
      const themes = data["hydra:member"] ?? data;

      select.innerHTML =
        '<option value="">-- Sélectionner un thème --</option>';
      themes.forEach((t) => {
        const option = document.createElement("option");
        option.value = t.id;
        option.textContent = t.libelle ?? t.nom;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Erreur lors du chargement des thèmes :", err);
    }
  }

  // 5. MODULE PLATS
  let rawPlats = [];
  let rawAllergenes = [];

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
                <img src="${plat.photo || "../images/entrepriseImg1.jpg"}" 
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

    const selectAllergenes = document.getElementById("plat-allergenes");
    if (selectAllergenes) {
      selectAllergenes.innerHTML = rawAllergenes.length
        ? rawAllergenes
            .map(
              (allergene) =>
                `<option value="${allergene.id}">${allergene.libelle}</option>`,
            )
            .join("")
        : `<option value="" disabled>Aucun allergène disponible</option>`;
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

        const selectedAllergenes = (plat.allergenes ?? []).map((allergene) =>
          String(allergene.id),
        );
        Array.from(selectAllergenes?.options ?? []).forEach((option) => {
          option.selected = selectedAllergenes.includes(option.value);
        });
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
        allergenes: Array.from(
          document.getElementById("plat-allergenes")?.selectedOptions ?? [],
        ).map((option) => `/api/allergenes/${option.value}`),
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

  // MODALE MENU (Instanciation basée sur ton id "openEditMenuModal")
  let modalMenuInstance = null;
  const modalMenuEl = document.getElementById("openEditMenuModal");
  if (modalMenuEl && typeof bootstrap !== "undefined") {
    modalMenuInstance = new bootstrap.Modal(modalMenuEl);
  }

  window.openEditMenuModal = async (id = null) => {
    document.getElementById("menu-id").value = "";
    document.getElementById("form-menu")?.reset();

    if (id) {
      const menu = rawMenus.find((m) => m.id === id);
      if (menu) {
        const modalTitle = document.getElementById("modalMenuTitle");
        if (modalTitle) modalTitle.textContent = "Modifier le menu";

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

        if (menu.theme?.id) {
          document.getElementById("menu-theme").value = menu.theme.id;
        }

        const selectPlats = document.getElementById("menu-plats");
        const selectedPlatIds = (menu.plats ?? []).map((p) => String(p.id));
        Array.from(selectPlats?.options ?? []).forEach((opt) => {
          opt.selected = selectedPlatIds.includes(opt.value);
        });
      }
    } else {
      const modalTitle = document.getElementById("modalMenuTitle");
      if (modalTitle) modalTitle.textContent = "Créer un nouveau menu";
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

      const selectedPlats = Array.from(
        document.getElementById("menu-plats").selectedOptions,
      ).map((option) => `/api/plat/${option.value}`);

      const selectedTheme = document.getElementById("menu-theme").value;

      if (!selectedTheme || selectedPlats.length === 0) {
        alert("Veuillez sélectioner un thème et au moins un plat.");
        return;
      }
      const prixInput = document.getElementById("menu-prix");
      const menuBody = {
        titre: document.getElementById("menu-titre").value,
        description: document.getElementById("menu-description").value,
        quantite_restante: parseInt(
          document.getElementById("menu-quantite").value,
          10,
        ),
        prix_par_personne: String(document.getElementById("menu-prix").value),
        nombre_personne_minimum: parseInt(
          document.getElementById("menu-min-pers").value,
          10,
        ),
        temps_preparation: parseInt(
          document.getElementById("menu-temps-prep").value,
          10,
        ),
        theme: `/api/theme/${selectedTheme}`,
        plats: selectedPlats,
      };

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(menuBody),
        });
        console.log("body envoyé :", JSON.stringify(menuBody));

        if (response.ok) {
          modalMenuInstance?.hide();
          loadMenus();
        } else {
          const err = await response.json();
          alert(
            err.detail ??
              err.message ??
              "Erreur lors de l'enregistrement du menu.",
          );
        }
      } catch (e) {
        console.error(e);
      }
    });

  // INITIALISATION
  await fetchCommandes();
  await fetchAvis();
  await loadThemesSelect();
  await loadPlats();
  await loadMenus();
})();
