const API_URL = "http://127.0.0.1:8000";
const PASSWORD_REQUEST_ENDPOINT = `${API_URL}/api/account/passwordRequest`;
const PASSWORD_RESET_ENDPOINT = `${API_URL}/api/account/resetPassword`;

async function requestPasswordReset(email) {
    const response = await fetch(PASSWORD_REQUEST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
    }

    return data.message || "Si cette adresse existe, un lien de réinitialisation a été envoyé.";
}

(async () => {
    const requestForm = document.querySelector("#forgot-password-form");
    const resetForm = document.querySelector("#reset-password-form");
    const message = document.querySelector("#reset-password-message");
    const intro = document.querySelector("#reset-password-intro");
    const queryToken = new URLSearchParams(window.location.search).get("token");
    const pathToken = window.location.pathname.match(
        /^\/(?:reset-mdp|reset-password|resetPassword)\/([^/]+)$/,
    )?.[1];
    const token = queryToken || pathToken;

    const showMessage = (text, isError = false) => {
        message.textContent = text;
        message.classList.toggle("text-danger", isError);
        message.classList.toggle("text-success", !isError);
    };

    if (token) {
        requestForm?.classList.add("d-none");
        resetForm?.classList.remove("d-none");
        if (intro) intro.textContent = "Choisissez votre nouveau mot de passe.";
    }

    requestForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.querySelector("#reset-email").value.trim();

        try {
            showMessage(await requestPasswordReset(email));
            requestForm.reset();
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    resetForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = document.querySelector("#new-password").value;
        const confirmation = document.querySelector("#password-confirmation").value;

        if (password !== confirmation) {
            showMessage("Les deux mots de passe ne correspondent pas.", true);
            return;
        }

        try {
            const response = await fetch(PASSWORD_RESET_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Le lien est invalide ou expiré.");
            }
            showMessage(data.message || "Mot de passe modifié. Vous pouvez vous connecter.");
            resetForm.reset();
        } catch (error) {
            showMessage(error.message, true);
        }
    });
})();