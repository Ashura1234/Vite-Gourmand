async function loadAvis() {
  const container = document.getElementById("avis-container");
  if (!container) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/avis", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok)
      throw new Error("Erreur lors de la récupération des avis");

    const data = await response.json();
    const avisList = data["hydra:member"] ?? data;

    const avisValides = avisList
      .filter((avis) => {
        const statut = String(avis.statut ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return statut === "valide" || statut === "publie";
      })
      .slice(0, 4);

    if (avisValides.length === 0) {
      container.innerHTML =
        "<p class='text-muted'>Aucun avis pour le moment.</p>";
      return;
    }

    const renderAvisCard = (avis) => `
      <article class="avis-card">
        <img class="avis-card-avatar" src="/images/photoProfil.jpg" alt="Photo de profil" />
        <div class="avis-card-content">
          <div class="avis-card-header">
            <strong>${escapeHtml(avis.user?.prenom || avis.nom_auteur || "Anonyme")}</strong>
            <span class="avis-card-rating">${escapeHtml(avis.note ?? "—")}/5</span>
          </div>
          <p>${escapeHtml(avis.description || "")}</p>
        </div>
      </article>
    `;

    container.innerHTML = `
      <div class="avis-carousel" aria-label="Avis clients">
        <div class="avis-track">
          ${avisValides.map(renderAvisCard).join("")}
          ${avisValides.map(renderAvisCard).join("")}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur avis :", error);
    container.innerHTML =
      "<p class='text-danger'>Impossible de charger les avis.</p>";
  }
}

async function loadFeaturedMenus() {
  const container = document.getElementById("featured-menus-container");
  if (!container) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/menu", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Erreur lors de la récupération des menus");

    const data = await response.json();
    const menus = (data["hydra:member"] ?? data).slice(0, 3);

    if (menus.length === 0) {
      container.innerHTML = "<p class='text-muted'>Aucun menu disponible pour le moment.</p>";
      return;
    }

    container.innerHTML = menus
      .map((menu) => {
        const image = menu.imageMenus?.[0]?.ImageMenu;
        const imageSrc = image
          ? `http://127.0.0.1:8000/uploads/menus/${image}`
          : "/images/entrepriseImg1.jpg";

        return `
          <article class="featured-menu-card">
            <div class="featured-menu-media">
              <span class="featured-menu-index">0${menus.indexOf(menu) + 1}</span>
              <img src="${imageSrc}" alt="${escapeHtml(menu.titre || "Menu traiteur")}" />
            </div>
            <div class="featured-menu-content">
              <span class="featured-menu-kicker">Sélection Vite & Gourmand</span>
              <h3>${escapeHtml(menu.titre || "Menu")}</h3>
              <p>${escapeHtml(menu.description || "Découvrez ce menu traiteur.")}</p>
              <div class="featured-menu-footer">
                <strong>${escapeHtml(menu.prix_par_personne ?? "—")} € <small>/ personne</small></strong>
                <a href="/menuDetail?id=${encodeURIComponent(menu.id)}" onclick="route(event)" class="featured-menu-link">Découvrir <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Erreur menus à la une :", error);
    container.innerHTML =
      "<p class='text-danger'>Impossible de charger les menus.</p>";
  }
}

// Fonction utilitaire XSS
function escapeHtml(str) {
  return String(str ?? "").replace(
        /[&<>"']/g,
        (match) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[match],
      );
}

loadAvis();
loadFeaturedMenus();
