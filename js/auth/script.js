const tokenCookieName = "accesToken";
const btnDeconnexion = document.getElementById("btn-deconnexion");
const btnDeconnexionCompte = document.getElementById("btn-deconnexion-modal");
const roleCookieName = "role";
const apiUrl = "http://127.0.0.1:8000/api/";
if (btnDeconnexion) {
  btnDeconnexion.addEventListener("click", deconnected);
}

function getRole() {
  return getCookie(roleCookieName);
}

function deconnected() {
  eraseCookie(tokenCookieName);
  eraseCookie(roleCookieName);
  window.location.reload();
}

function setToken(token) {
  setCookie(tokenCookieName, token, 7);
}

function getToken() {
  return getCookie(tokenCookieName);
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function isConnected() {
  return getToken() != null && getToken() != undefined;
}

function showAndHideElement() {
  const userConnected = isConnected();
  const role = getRole();

  const roles = role ? role.split(",").map((value) => value.trim()) : [];
  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("admin");
  const isEmployee =
    roles.includes("employe") ||
    roles.includes("employé") ||
    roles.includes("ROLE_EMPLOYE") ||
    roles.includes("ROLE_EMPLOYEE");

  const allElementToEdit = document.querySelectorAll("[data-show]");
  allElementToEdit.forEach((element) => {
    const rules = element.dataset.show.split(",").map((value) => value.trim());
    const visible = rules.some((rule) => {
      if (rule === "disconnected") return !userConnected;
      if (rule === "connected") return userConnected;
      if (rule === "admin") return userConnected && isAdmin;
      if (rule === "employe") return userConnected && isEmployee;
      return false;
    });

    element.classList.toggle("d-none", !visible);
  });
}

showAndHideElement();

document.addEventListener("DOMContentLoaded", () => {
    const modalAvis = document.getElementById("modalAvis");
    if (modalAvis) {
        modalAvis.addEventListener("show.bs.modal", () => {

            // boutons de note réinitialisé à chaque ouverture
            const noteBtns = document.querySelectorAll('.note-btn');
            const noteInput = document.getElementById('noteInput');

            noteBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    noteBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    noteInput.value = btn.dataset.value;
                    console.log("note sélectionnée :", noteInput.value);
                });
            });

            // Bouton publier
            const btnPublierAvis = document.getElementById("btnPublierAvis");
            const newBtn = btnPublierAvis.cloneNode(true);
            btnPublierAvis.parentNode.replaceChild(newBtn, btnPublierAvis);

            newBtn.addEventListener("click", async () => {
                const note = document.getElementById("noteInput")?.value;
                const description = document.getElementById("avisCommentaire").value;
                console.log("note :", note, "description :", description);

                const errorEl = document.getElementById("avis-error");
                const successEl = document.getElementById("avis-success");
                errorEl.classList.add("d-none");
                successEl.classList.add("d-none");

                if (!note || !description) {
                    errorEl.textContent = "Veuillez donner une note et un commentaire.";
                    errorEl.classList.remove("d-none");
                    return;
                }

                try {
                    const response = await fetch("http://127.0.0.1:8000/api/avis", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "X-AUTH-TOKEN": getToken()
                        },
                        body: JSON.stringify({
                            note: note,
                            description: description,
                            statut: "en attente"
                        })
                    });

                    console.log("status :", response.status);
                    const data = await response.json();
                    console.log("data :", data);

                    if (response.ok) {
                        successEl.textContent = "Votre avis a été publié !";
                        successEl.classList.remove("d-none");
                        document.getElementById("noteInput").value = "";
                        document.querySelectorAll('.note-btn').forEach(b => b.classList.remove('active'));
                        document.getElementById("avisCommentaire").value = "";
                    } else {
                        errorEl.textContent = data.detail ?? "Une erreur est survenue.";
                        errorEl.classList.remove("d-none");
                    }
                } catch (error) {
                    console.error("Erreur :", error);
                    errorEl.textContent = "Impossible de publier l'avis.";
                    errorEl.classList.remove("d-none");
                }
            });
        });
    }
});

