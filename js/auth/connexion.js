console.log("connexion.js chargé");
const mailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnConnexion = document.getElementById("btn-connexion");

btnConnexion.addEventListener("click", checkAuth);

function checkAuth(){
    //appel de l'api pour vérifier les informations utilisateur en BDD

    if (mailInput.value == "test@mail.com" && passwordInput.value =="1"){ 
        const token = "eijiojoijrijihjroijhirjhoirjhoirjhiorjhoirjhtijrtoiorijtei";
        setToken(token);

        setCookie(roleCookieName, "User", 7);
        window.location.replace("/")
    }else{
        mailInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
    }
}