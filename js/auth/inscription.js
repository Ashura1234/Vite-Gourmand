const inputPrenom = document.getElementById("prenom");
const inputNom = document.getElementById("nom");
const inputMail = document.getElementById("email");
const inputMdp = document.getElementById("password");
const inputValideMdp = document.getElementById("confirmPassword");
const inputVille = document.getElementById("ville");
const inputPays = document.getElementById("pays");
const inputTel = document.getElementById("phoneNumber");
const inputAdressePostale = document.getElementById("adresse");
const btnInscription = document.getElementById("btn-inscription");
const formInscription = document.getElementById("formInscription");

btnInscription.addEventListener("click", inscriptionUser);

inputPrenom.addEventListener("keyup", validateForm);
inputNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputMdp.addEventListener("keyup", validateForm);
inputValideMdp.addEventListener("keyup", validateForm);
inputVille.addEventListener("keyup", validateForm);
inputPays.addEventListener("keyup", validateForm);
inputTel.addEventListener("keyup", validateForm);
inputAdressePostale.addEventListener("keyup", validateForm);


function validateForm() {
    const prenomOk = ValidateRequired(inputPrenom);
    const nomOk = ValidateRequired(inputNom);
    const mailOk = mailValid(inputMail);
    const mdpOk = mdpValid(inputMdp);
    const mdpValide = mdpvalided(inputMdp, inputValideMdp);
    const villeOk = ValidateRequired(inputVille);
    const paysOk = ValidateRequired(inputPays);
    const telOk = telValid(inputTel);
    const AdressePostaleOk = ValidateRequired(inputAdressePostale);

    if (prenomOk && nomOk && mailOk && mdpOk && mdpValide && villeOk && paysOk && AdressePostaleOk && telOk) {
        btnInscription.disabled = false;
    } else {
        btnInscription.disabled = true;
    }
}

function mdpvalided(inputMdp, inputValideMdp) {
    if (inputMdp.value === inputValideMdp.value && inputMdp.value !== "") {
        inputValideMdp.classList.add("is-valid");
        inputValideMdp.classList.remove("is-invalid");
        return true;
    } else {
        inputValideMdp.classList.add("is-invalid");
        inputValideMdp.classList.remove("is-valid");
        return false;
    }
}

function mdpValid(input) {
    const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    if (input.value.match(mdpRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function mailValid(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input.value.match(emailRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function telValid(input) {
    const telRegex = /^(\+33|0)[1-9](\s?\d{2}){4}$/;
    if (input.value.match(telRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function ValidateRequired(input) {
    if (input.value !== "") {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function inscriptionUser() {
    const dataForm = new FormData(formInscription);
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-AUTH-TOKEN", "57a2e8f46ab06a155b9e3a74b46ceae40cf68644");
    myHeaders.append("Cookie", "sf_redirect=%7B%22token%22%3A%22f66ad5%22%2C%22route%22%3A%22app_apiinscription%22%2C%22method%22%3A%22POST%22%2C%22controller%22%3A%7B%22class%22%3A%22App%5C%5CController%5C%5CSecurityController%22%2C%22method%22%3A%22inscription%22%2C%22file%22%3A%22C%3A%5C%5CUsers%5C%5Cmpouh%5C%5Cvite_gourmand_backend%5C%5Csrc%5C%5CController%5C%5CSecurityController.php%22%2C%22line%22%3A66%7D%2C%22status_code%22%3A201%2C%22status_text%22%3A%22Created%22%7D");
    
    const raw = JSON.stringify({
        "email": dataForm.get("email"),
        "password": dataForm.get("mdp"),
        "prenom": dataForm.get("prenom"),
        "telephone": dataForm.get("telephone"),
        "ville": dataForm.get("ville"),
        "pays": dataForm.get("pays"),
        "adresse_postale": dataForm.get("adresse")
    });
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    
    fetch(apiUrl+"inscription", requestOptions)
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            alert("Erreur lors de l'inscription");
        }
    })
    .then((result) =>
        {
        alert("Inscription réussie, bienvenue ! "+dataForm.get("prenom")+" Vous pouvez désormais vous connecter.")
        document.location.href="/connexion"
    })
    .catch((error) => console.error(error));
    
}