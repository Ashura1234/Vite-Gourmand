async function fetchMenus() {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("X-AUTH-TOKEN", getToken());


    const response = await fetch("http://127.0.0.1:8000/api/menu", {
        method: "GET",
        headers: myHeaders
    });

    
    const menus = await response.json();
    afficherMenus(menus);
}

function afficherMenus(menus) {
    const wrapper = document.getElementById("menus-container");
    wrapper.innerHTML = "";

    menus.forEach(menu => {
        // Attention au 'M' majuscule dans imageMenus et ImageMenu !
        const premiereImage = menu.imageMenus?.[0]?.ImageMenu ?? null;

        const imgSrc = premiereImage
            ? `http://127.0.0.1:8000/uploads/menus/${premiereImage}`
            : "../images/entrepriseImg1.jpg";

        wrapper.insertAdjacentHTML("beforeend", `
            <div class="menu-card">
                <img src="${imgSrc}" alt="${menu.titre}"/>
                <div class="menu-card-body">
                    <span class="menu-tag">${menu.titre}</span>
                    <p>${menu.description}</p>
                    <p><strong>${menu.prix_par_personne}€</strong> / personne</p>
                    <a href="/menuDetail?id=${menu.id}" onclick="route(event)" class="btn btn-secondary mt-2 text-white">Voir le menu</a>
                </div>
            </div>
        `);
    });
}

fetchMenus();
