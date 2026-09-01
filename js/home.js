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

    const avisList = await response.json();
    console.log(avisList);

    // Filtrer les avis validés si ton backend ne le fait pas déjà
    const avisValides = avisList
      .filter((a) => a.statut === "validé")
      .slice(0, 4);

    if (avisValides.length === 0) {
      container.innerHTML =
        "<p class='text-muted'>Aucun avis pour le moment.</p>";
      return;
    }

    container.innerHTML = avisValides
      .map(
        (avis) => `
      <div class="menu-card">
        <img src="${avis.avatar || "../images/photoProfil.jpg"}" alt="Avatar ${avis.pseudo || "Utilisateur"}" />
        <div class="menu-card-body">
          <span class="menu-tag">${escapeHtml(avis.user.prenom || "Anonyme")}</span>
          <p>${escapeHtml(avis.description)}</p>
          <span class="menu-tag1">
            Note : <p>${avis.note}/5 ⭐</p>
          </span>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Erreur avis :", error);
    container.innerHTML =
      "<p class='text-danger'>Impossible de charger les avis.</p>";
  }
}

// Fonction utilitaire XSS
function escapeHtml(str) {
  return str
    ? str.replace(
        /[&<>"']/g,
        (match) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[match],
      )
    : "";
}

loadAvis();
