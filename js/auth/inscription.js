const inputPrenom = document.getElementById("prenom");
const inputNom = document.getElementById("nom");
const inputMail = document.getElementById("email");
const inputMdp = document.getElementById("password");
const inputValideMdp = document.getElementById("confirmPassword");
const inputVille = document.getElementById("ville");
const inputPays = document.getElementById("pays");
const inputTel = document.getElementById("phoneNumber");
const btnInscription = document.getElementById("btn-inscription");

inputPrenom.addEventListener("keyup", validateForm);
inputNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputMdp.addEventListener("keyup", validateForm);
inputValideMdp.addEventListener("keyup", validateForm);
inputVille.addEventListener("keyup", validateForm);
inputPays.addEventListener("keyup", validateForm);
inputTel.addEventListener("keyup", validateForm);


function validateForm() {
    const prenomOk = ValidateRequired(inputPrenom);
    const nomOk = ValidateRequired(inputNom);
    const mailOk = mailValid(inputMail);
    const mdpOk = mdpValid(inputMdp);
    const mdpValide = mdpvalided(inputMdp, inputValideMdp);
    const villeOk = ValidateRequired(inputVille);
    const paysOk = ValidateRequired(inputPays);
    const telOk = telValid(inputTel);

    if (prenomOk && nomOk && mailOk && mdpOk && mdpValide && villeOk && paysOk && telOk) {
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