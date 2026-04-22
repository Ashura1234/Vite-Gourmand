import Route from "./Route.js";
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/menu", "Menu", "/pages/menu.html"),
    new Route("/menuBordelais", "Menu bordelais", "/pages/menu/menuBordelais.html"),
    new Route("/menuPrintanier", "Menu Printanier", "/pages/menu/menuPrintanier.html"),
    new Route("/menuPrestige", "Menu Prestige", "/pages/menu/menuPrestige.html"),
    new Route("/menuTerreEtMer", "Menu Terre et Mer", "/pages/menu/menuTerreEtMER.html"),
];
export const websiteName = "Vite & Gourmand";