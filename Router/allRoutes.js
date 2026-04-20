import Route from "./Route.js";
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/menu", "Menu", "/pages/menu.html"),
    new Route("/menuBordelais", "Menu bordelais", "/pages/menu/menuBordelais.html"),
];
export const websiteName = "Vite & Gourmand";