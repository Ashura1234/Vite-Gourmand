import Route from "./Route.js";
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", "/js/menu.js"),
    new Route("/menu", "Menu", "/pages/menu.html", "/js/menu.js"),
    new Route("/commande", "Mes commande", "/pages/menu/commandeUser/commandeUser.html"),
    new Route("/menuBordelais", "Menu bordelais", "/pages/menu/menuBordelais.html"),
    new Route("/menuPrintanier", "Menu Printanier", "/pages/menu/menuPrintanier.html"),
    new Route("/menuPrestige", "Menu Prestige", "/pages/menu/menuPrestige.html"),
    new Route("/menuTerreEtMer", "Menu Terre et Mer", "/pages/menu/menuTerreEtMER.html"),
    new Route("/menuVegetarien", "Menu végétarien", "/pages/menu/menuVegetarien.html"),
    new Route("/menuEnfant", "Menu Enfant", "/pages/menu/menuEnfant.html"),
    new Route("/menuCocktail", "Menu Cocktail", "/pages/menu/menuCocktail.html"),
    new Route("/menuBrunch", "Menu Brunch", "/pages/menu/menuBrunch.html"),
    new Route("/menuDetail", "Menu détaillé", "/pages/menu/detail/menuDetails.html", "/js/menuDetails.js"),
    new Route("/menuSushi", "Menu Sushi", "/pages/menu/menuSushi.html"),
    new Route("/menuEntreprise", "Menu Entreprise", "/pages/menu/MenuEntreprise.html"),
    new Route("/menuPoisson", "Menu Poisson", "/pages/menu/menuPoisson.html"),
    new Route("/connexion", "Connexion", "/pages/auth/connexion.html", "/js/auth/connexion.js"),
    new Route("/inscription", "Inscription", "/pages/auth/inscription.html", "/js/auth/inscription.js"),
];
export const websiteName = "Vite & Gourmand";