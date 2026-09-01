(async () => {
  let allMenus = [];
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("X-AUTH-TOKEN", getToken());

  const filtersState = {
    theme: "",
    regime: "",
    priceMin: 0,
    priceMax: 9999,
    persMin: 0,
    persMax: 9999,
  };

  // 1. Récupération des menus
  async function fetchMenus() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/menu", {
        method: "GET",
        headers: myHeaders,
      });
      if (!response.ok) throw new Error("Erreur API");
      allMenus = await response.json();
      applyFilters();
    } catch (error) {
      console.error("Erreur :", error);
      document.getElementById("menus-container").innerHTML =
        `<p class="text-white">Impossible de charger les menus.</p>`;
    }
  }

  // 2. Filtres
  function applyFilters() {
    const filtered = allMenus.filter((menu) => {
      const matchTheme =
        !filtersState.theme ||
        menu.theme?.libelle?.toLowerCase() === filtersState.theme.toLowerCase();

      const matchRegime =
        !filtersState.regime ||
        menu.regime?.toLowerCase() === filtersState.regime.toLowerCase();

      const price = parseFloat(menu.prix_par_personne ?? 0);
      const matchPrice =
        price >= filtersState.priceMin && price <= filtersState.priceMax;

      const pers = parseInt(menu.nombre_personne_minimum ?? 1);
      const matchPers =
        pers >= filtersState.persMin && pers <= filtersState.persMax;

      return matchTheme && matchRegime && matchPrice && matchPers;
    });

    afficherMenus(filtered);
  }

  // 3. Affichage des cartes
  function afficherMenus(menus) {
    const wrapper = document.getElementById("menus-container");
    wrapper.innerHTML = "";

    if (menus.length === 0) {
      wrapper.innerHTML = `<p class="text-white-50 text-center">Aucun menu ne correspond à vos filtres.</p>`;
      return;
    }

    menus.forEach((menu) => {
      const premiereImage = menu.imageMenus?.[0]?.ImageMenu ?? null;
      const imgSrc = premiereImage
        ? `http://127.0.0.1:8000/uploads/menus/${premiereImage}`
        : "../images/entrepriseImg1.jpg";

      wrapper.insertAdjacentHTML(
        "beforeend",
        `
                <div class="menu-card">
                    <img src="${imgSrc}" alt="${menu.titre}"/>
                    <div class="menu-card-body">
                        <span class="menu-tag">${menu.titre}</span>
                        <p>${menu.description}</p>
                        <p><strong>${menu.prix_par_personne}€</strong> / personne <i class="bi bi-person-fill"></i></p>
                        <a href="/menuDetail?id=${menu.id}" onclick="route(event)" class="btn btn-secondary mt-2 text-white">Voir le menu</a>
                    </div>
                </div>
            `,
      );
    });
  }

  // Thème
  document
    .querySelectorAll("#dropdown-theme .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        filtersState.theme = item.dataset.value ?? "";
        document.getElementById("label-theme").textContent =
          item.textContent.trim() || "Thème";
        applyFilters();
        console.log(allMenus.map((m) => m.theme));
      });
    });

  // Régime
  document
    .querySelectorAll("#dropdown-regime .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        filtersState.regime = item.dataset.value ?? "";
        document.getElementById("label-regime").textContent =
          item.textContent.trim() || "Régime";
        applyFilters();
        console.log(allMenus.map((m) => m.regime));
      });
    });

  // Prix
  const btnApplyPrice = document.getElementById("btn-apply-price");
  if (btnApplyPrice) {
    btnApplyPrice.addEventListener("click", () => {
      filtersState.priceMin =
        parseFloat(document.getElementById("input-price-min").value) || 0;
      filtersState.priceMax =
        parseFloat(document.getElementById("input-price-max").value) || 9999;
      document.getElementById("label-prix").textContent =
        `${filtersState.priceMin}€ - ${filtersState.priceMax}€`;
      applyFilters();
    });
  }

  // Personnes
  document
    .querySelectorAll(".dropdown-personnes .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        filtersState.persMin = parseInt(item.dataset.min) || 0;
        filtersState.persMax = parseInt(item.dataset.max) || 9999;
        document.getElementById("label-personnes").textContent =
          item.textContent.trim();
        applyFilters();
      });
    });

  fetchMenus();
})();
