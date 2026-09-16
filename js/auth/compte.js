(async () => {
    const accountCacheKey = "compteInfos";

    function renderCompteInfos(data) {
        const fields = {
            "compte-prenom": data.prenom,
            "compte-email": data.email,
            "compte-telephone": data.telephone,
            "compte-ville": data.ville,
            "compte-pays": data.pays,
            "compte-adresse": data.adresse_postale,
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value ?? "—";
        });
    }

    const cachedInfos = sessionStorage.getItem(accountCacheKey);
    if (cachedInfos) {
        try {
            renderCompteInfos(JSON.parse(cachedInfos));
        } catch {
            sessionStorage.removeItem(accountCacheKey);
        }
    }

    const token = getToken();
    if (!token) {
        window.location.replace("/connexion");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/account/me", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-AUTH-TOKEN": token,
            },
            cache: "no-store",
        });

        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

        const data = await response.json();
        sessionStorage.setItem(accountCacheKey, JSON.stringify(data));
        renderCompteInfos(data);
    } catch (error) {
        console.error("Erreur lors du chargement du compte :", error);
    }

    document
        .getElementById("btn-deconnexion-page")
        ?.addEventListener("click", deconnected);
})();