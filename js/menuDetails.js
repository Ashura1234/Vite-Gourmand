(async () => {
  const params = new URLSearchParams(window.location.search);
  const menuId = params.get("id");

  if (!menuId) {
    document.getElementById("main-page").innerHTML = `
            <div class="container py-5 text-center">
                <h1>Menu introuvable</h1>
            </div>
        `;
    return;
  }

  async function fetchMenuDetail() {
    try {
      const menuResponse = await fetch(
        `http://localhost:8000/api/menu/${menuId}`,
      );
      if (!menuResponse.ok) throw new Error("Menu introuvable");
      const menu = await menuResponse.json();

      const imgResponse = await fetch(
        `http://localhost:8000/api/image-menu/menu/${menuId}`,
      );
      const images = imgResponse.ok ? await imgResponse.json() : [];

      const platsDetails = await Promise.all(
        (menu.plats ?? []).map(async (plat) => {
          const platResponse = await fetch(
            `http://localhost:8000/api/plat/${plat.id}`
          );
          const data = await platResponse.json();
          return platResponse.ok ? data : null;
          return platResponse.ok ? await platResponse.json() : null;
        }),
      );
      const plats = platsDetails.filter((p) => p !== null);

      afficherDetail(menu, images, plats);
    } catch (error) {
      console.error("Erreur :", error);
    }
  }

  function afficherDetail(menu, images, plat) {
    document.getElementById("menuTitre").textContent = menu.titre ?? "—";
    document.getElementById("menuPrix").innerHTML =
      `<h4>/ ${menu.prix_par_personne ?? 0}€</h4>`;

    const menuImages = document.getElementById("menuImages");
    menuImages.innerHTML = "";
    if (images.length > 0) {
      images.forEach((img) => {
        menuImages.innerHTML += `
                    <img 
                        src="http://localhost:8000/uploads/menus/${img.chemin}" 
                        class="detail-img img-marker" 
                        alt="${menu.titre}"
                    />
                `;
      });
    } else {
      menuImages.innerHTML = `<p class="text-white">Aucune image disponible</p>`;
    }

    const menuTags = document.getElementById("menuTags");
    menuTags.innerHTML = "";
    if (menu.tags && menu.tags.length > 0) {
      menu.tags.forEach((tag) => {
        menuTags.innerHTML += `<span class="detail-tag">${tag}</span>`;
      });
    }

    const menuPlats = document.getElementById("menuPlats");
    menuPlats.innerHTML = "";

    if (plat.length > 0) {
      plat.forEach((p) => {
        const allergenes =
          p.allergenes && p.allergenes.length > 0
            ? p.allergenes.map((a) => a.libelle).join(", ")
            : "Aucun";

        menuPlats.innerHTML += `
            <div class="detail-item">
                <span class="detail-icon">🍽️</span>
                <div>
                    <strong>${p.titre_plat} - </strong> ${p.description}
                    <br>
                    <span class="detail-allergene">Allergènes : ${allergenes}</span>
                </div>
            </div>
        `;
      });
    } else {
      menuPlats.innerHTML = `<p class="text-white-50">Aucun plat disponible</p>`;
    }

    document.getElementById("modalTitre").textContent = menu.titre ?? "—";
    document.getElementById("modalPrix").innerHTML =
      `<i class="bi bi-person-fill"></i> ${menu.prix_par_personne ?? 0}€`;
    document.getElementById("modalStock").innerHTML =
      `<i class="bi bi-box-seam"></i> ${menu.quantite_restante ?? 0} en stock`;
    document.getElementById("modalTempsPreparation").innerHTML =
      `<i class="bi bi-stopwatch-fill"></i> ${menu.tempsPreparation ?? 0} min`;

    if (images.length > 0) {
      document.getElementById("modalImage").src =
        `http://localhost:8000/uploads/menus/${images[0].chemin}`;
    }
  }

  fetchMenuDetail();
})();
