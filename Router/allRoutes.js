import Route from "./Route.js";
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", "/js/home.js"),
    new Route("/menu", "Menu", "/pages/menu.html", "/js/menu.js"),
    new Route("/commande", "Mes commande", "/pages/menu/commandeUser/commandeUser.html", "/js/userCommande.js", false, "connected"),
    new Route("/menuDetail", "Menu détaillé", "/pages/menu/detail/menuDetails.html", "/js/menuDetails.js"),
    new Route("/menuSushi", "Menu Sushi", "/pages/menu/menuSushi.html"),
    new Route("/menuEntreprise", "Menu Entreprise", "/pages/menu/MenuEntreprise.html"),
    new Route("/menuPoisson", "Menu Poisson", "/pages/menu/menuPoisson.html"),
    new Route("/connexion", "Connexion", "/pages/auth/connexion.html", "/js/auth/connexion.js"),
    new Route("/inscription", "Inscription", "/pages/auth/inscription.html", "/js/auth/inscription.js"),
    new Route("/compte", "Mon compte", "/pages/auth/compte.html", "/js/auth/compte.js", false, "connected"),
    new Route("/dashboard", "Dashboard Admin", "/pages/admin/dashboard.html", "/js/admin/dashboard.js", false, "admin"),
    new Route("/dashboardEmploye", "Dashboard employé", "/pages/employes/employes.html", "/js/employes/employes.js", false, "employeeOrAdmin"),
    new Route("/reset-mdp", "Réinitialiser le mot de passe", "/pages/auth/reset-mdp.html", "/js/auth/reset-mdp.js"),
    new Route("/reset-password", "Réinitialiser le mot de passe", "/pages/auth/reset-mdp.html", "/js/auth/reset-mdp.js"),
    new Route("/resetPassword", "Réinitialiser le mot de passe", "/pages/auth/reset-mdp.html", "/js/auth/reset-mdp.js"),
];
export const websiteName = "Vite & Gourmand";