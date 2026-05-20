async function fetchMenus() {
  const myHeaders = new Headers();
  const token = getToken();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("X-AUTH-TOKEN", token);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/menu", {
      method: "GET",
      headers: myHeaders,
    });

    if (!response.ok) {
      console.error("Erreur API :", response.status);
      return;
    }

    const menus = await response.json();

    // Récupère les images pour chaque menu
    const menusAvecImages = await Promise.all(
      menus.map(async (menu) => {
        try {
          const imgResponse = await fetch(
            `http://127.0.0.1:8000/api/image-menu/menu/${menu.id}`,
          );
          if (imgResponse.ok) {
            const images = await imgResponse.json();
            menu.imageUrl = images[0]?.chemin ?? null;
          }
        } catch (e) {
          menu.imageUrl = null;
        }
        return menu;
      }),
    );

    afficherMenus(menusAvecImages);
  } catch (error) {
    console.error("Erreur :", error);
  }
}

function afficherMenus(menus) {
  const wrapper = document.getElementById("menus-container");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  menus.forEach((menu) => {
    const imgSrc = menu.imageUrl
      ? `http://127.0.0.1:8000/uploads/menus/${menu.imageUrl}`
      : "../images/entrepriseImg1.jpg";

    const card = `
            <div class="menu-card">
                <img src="${imgSrc}" alt="${menu.titre}"/>
                <div class="menu-card-body">
                    <span class="menu-tag">${menu.titre}</span>
                    <p>${menu.description}</p>
                    <p><strong>${menu.prix_par_personne}€</strong> / personne</p>
                    <a href="/menuDetail?id=${menu.id}" onclick="route(event)" class="btn btn-secondary mt-2 text-white">Voir le menu</a>
                </div>
            </div>
        `;
    wrapper.insertAdjacentHTML("beforeend", card);
  });
}

fetchMenus();
