const mailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnConnexion = document.getElementById("btn-connexion");
const connexionForm = document.getElementById("formConnexion");
btnConnexion.addEventListener("click", checkAuth);

function checkAuth() {
  //appel de l'api pour vérifier les informations utilisateur en BDD
  const dataForm = new FormData(connexionForm);
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    username: dataForm.get("email"),
    password: dataForm.get("mdp"),
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(apiUrl + "login", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        mailInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
      }
    })
    .then((result) => {
      const token = result.apiToken;
      setToken(token);
      console.log("token récupéré :", token);
      setCookie(roleCookieName, result.roles[0], 7);
      window.location.replace("/");
    })
    .catch((error) => console.error(error));
}
