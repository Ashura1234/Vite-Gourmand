const modalMonCompte = document.getElementById("modalMonCompte");
const btnInfo = document.getElementById("btn-info-compte")

btnInfo.addEventListener("click", fetchCompteInfos);

 async function fetchCompteInfos() {
    const token = getToken();

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("X-AUTH-TOKEN", token);

    try {
        const response = await fetch("http://127.0.0.1:8000/api/account/me", {
            method: "GET",
            headers: myHeaders
        });

        console.log("status :", response.status);
        const data = await response.json();
        console.log("data :", data);

        if (response.ok) {
            document.getElementById("compte-prenom").textContent = data.prenom ?? "—";
            document.getElementById("compte-email").textContent = data.email ?? "—";
            document.getElementById("compte-telephone").textContent = data.telephone ?? "—";
            document.getElementById("compte-ville").textContent = data.ville ?? "—";
            document.getElementById("compte-pays").textContent = data.pays ?? "—";
            document.getElementById("compte-adresse").textContent = data.adresse_postale ?? "—";
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}

const btnDeconnexionModal = document.getElementById("btn-deconnexion-modal");
if (btnDeconnexionModal) {
    btnDeconnexionModal.addEventListener("click", deconnected);
}