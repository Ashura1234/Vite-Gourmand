(async () => {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AUTH-TOKEN": token,
  };

  // ONGLETS
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-tab]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-employes").classList.add("d-none");
      document.getElementById("tab-stats").classList.add("d-none");
      document
        .getElementById(`tab-${btn.dataset.tab}`)
        .classList.remove("d-none");
    });
  });

  // CRÉER UN EMPLOYÉ
  document
    .getElementById("btn-creer-employe")
    ?.addEventListener("click", async () => {
      const errorEl = document.getElementById("emp-error");
      const successEl = document.getElementById("emp-success");
      errorEl.classList.add("d-none");
      successEl.classList.add("d-none");

      const body = {
        email: document.getElementById("emp-email").value,
        password: document.getElementById("emp-password").value,
        prenom: document.getElementById("emp-prenom").value,
        telephone: document.getElementById("emp-telephone").value,
        ville: document.getElementById("emp-ville").value,
        pays: document.getElementById("emp-pays").value,
        adresse_postale: document.getElementById("emp-adresse").value,
      };

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/admin/employe",
          {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          },
        );

        if (response.ok) {
          successEl.textContent = "Employé créé avec succès !";
          successEl.classList.remove("d-none");
          loadEmployes();
        } else {
          const data = await response.json();
          errorEl.textContent = data.detail ?? "Une erreur est survenue.";
          errorEl.classList.remove("d-none");
        }
      } catch (e) {
        console.error(e);
      }
    });
  async function loadEmployes() {
    const container = document.getElementById("employes-list");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/employe", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-AUTH-TOKEN": getToken(),
        },
      });
      const employes = await response.json();

      if (employes.length === 0) {
        container.innerHTML = "<p class='text-white-50'>Aucun employé.</p>";
        return;
      }

      container.innerHTML = employes
        .map(
          (emp) => `
                <div class="d-flex justify-content-between align-items-center border-bottom border-secondary py-2">
                    <div>
                        <strong>${emp.prenom ?? "—"}</strong> — ${emp.email}
                        <span class="badge ${emp.is_active ? "bg-success" : "bg-danger"} ms-2">
                            ${emp.is_active ? "Actif" : "Inactif"}
                        </span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-warning" onclick="toggleActive(${emp.id}, ${emp.is_active})">
                            ${emp.is_active ? "Désactiver" : "Activer"}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${emp.id})">
                            Supprimer
                        </button>
                    </div>
                </div>
            `,
        )
        .join("");
    } catch (e) {
      console.error(e);
      container.innerHTML = "<p class='text-danger'>Erreur de chargement.</p>";
    }
  }

  // ACTIVER / DÉSACTIVER
  window.toggleActive = async (id, currentState) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/admin/account/${id}/active`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ is_active: !currentState }),
      });
      loadEmployes();
    } catch (e) {
      console.error(e);
    }
  };

  // SUPPRIMER UN USER
  window.deleteUser = async (id) => {
    if (!confirm("Supprimer cet employé ?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/admin/employe/${id}`, {
        method: "DELETE",
        headers,
      });
      loadEmployes();
    } catch (e) {
      console.error(e);
    }
  };

  // CHIFFRE D'AFFAIRES
  document
    .getElementById("btn-filter-ca")
    ?.addEventListener("click", async () => {
      const debut = document.getElementById("ca-date-debut").value;
      const fin = document.getElementById("ca-date-fin").value;
      const container = document.getElementById("ca-container");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/chiffreAffaires?debut=${debut}&fin=${fin}`,
          { method: "GET", headers },
        );
        const data = await response.json();
        console.log("CA :", data);

        container.innerHTML = data
          .map(
            (item) => `
                <div class="d-flex justify-content-between border-bottom border-secondary py-2">
                    <span>${item.menu ?? item.menu_titre ?? "—"}</span>
                    <strong>${item.chiffre_affaires ?? item.total ?? 0} €</strong>
                </div>
            `,
          )
          .join("");
      } catch (e) {
        console.error(e);
        container.innerHTML =
          "<p class='text-danger'>Erreur de chargement.</p>";
      }
    });

  // COMMANDES PAR MENU
  document
    .getElementById("btn-load-commandes")
    ?.addEventListener("click", async () => {
      const container = document.getElementById("commandes-container");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/admin/commandesParMenu",
          {
            method: "GET",
            headers,
          },
        );
        const data = await response.json();
        console.log("commandes :", data);

        container.innerHTML = data
          .map(
            (item) => `
                <div class="d-flex justify-content-between border-bottom border-secondary py-2">
                    <span>${item.menu ?? item.menu_titre ?? "—"}</span>
                    <strong>${item.nombre_commandes ?? item.total ?? 0} commandes</strong>
                </div>
            `,
          )
          .join("");
      } catch (e) {
        console.error(e);
        container.innerHTML =
          "<p class='text-danger'>Erreur de chargement.</p>";
      }
    });

  // Chargement
  loadEmployes();
})();
