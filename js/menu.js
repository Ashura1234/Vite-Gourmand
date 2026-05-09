async function fetchMenus() {
    const myHeaders = new Headers();
    const token = getToken();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("X-AUTH-TOKEN", token);

     try {
        const response = await fetch("http://127.0.0.1:8000/api/menu");

        if (!response.ok) {
            console.error("Erreur API :", response.status);
            return;
        }

        const menus = await response.json(); 

        afficherMenus(menus);

    } catch (error) {
        console.error("Erreur :", error);
    }
}

function afficherMenus(menus) {
    const wrapper = document.getElementById("menus-container");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    menus.forEach(menu => {
        const card = `
            <div class="menu-card">
                <img src="${menu.image ?? '../images/entrepriseImg1.jpg'}" alt="${menu.titre}"/>
                <div class="menu-card-body">
                    <span class="menu-tag">${menu.titre}</span>
                    <p>${menu.description}</p>
                    <p><strong>${menu.prix_par_personne}€</strong> / personne</p>
                    <a href="/menu/${menu.id}" class="btn btn-secondary mt-2 text-white">
                        Voir le menu
                    </a>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML("beforeend", card);
    });
}

fetchMenus();