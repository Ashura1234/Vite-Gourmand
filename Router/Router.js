import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

const route404 = new Route("404", "Page introuvable", "./pages/404.html");

const getRouteByUrl = (url) => {
  let currentRoute = null;
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  return currentRoute != null ? currentRoute : route404;
};

const LoadContentPage = async () => {
  const path = window.location.pathname;
  const actualRoute = getRouteByUrl(path);
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  document.getElementById("main-page").innerHTML = html;

  // Header/Footer
  if (actualRoute.hideLayout) {
    document.querySelector("header").classList.add("d-none");
    document.querySelector("footer").classList.add("d-none");
  } else {
    document.querySelector("header").classList.remove("d-none");
    document.querySelector("footer").classList.remove("d-none");
  }

  // recharge script
  if (actualRoute.pathJS != "") {
    const existingScript = document.querySelector(
      `script[src*="${actualRoute.pathJS}"]`,
    );
    if (existingScript) {
      existingScript.remove();
    }
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS + "?v=" + Date.now());
    document.querySelector("body").appendChild(scriptTag);
  }

  document.title = actualRoute.title + " - " + websiteName;
};

const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  LoadContentPage();
};

window.onpopstate = LoadContentPage;
window.route = routeEvent;
LoadContentPage();
