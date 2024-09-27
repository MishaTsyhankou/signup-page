document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.querySelector(".custom-dialog");
    const openButton = document.getElementById("open-dialog");
    const closeButton = dialog.querySelector(".close-button");
    const overlay = document.getElementById("overlay");
    const initialDialogContent = dialog.innerHTML;

    openButton.addEventListener("click", () => {
        dialog.innerHTML = initialDialogContent;
        dialog.showModal();
        overlay.style.display = 'block';

        const newCloseButton = dialog.querySelector(".close-button");
        newCloseButton.addEventListener("click", () => {
            dialog.close();
            overlay.style.display = 'none';
        });

        const form = dialog.querySelector("form");
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;

            try {
                const isAuthorized = await attemptLogin(email, password);
                if (isAuthorized) {
                    const token = await getAuthToken(email, password);
                    token && openAuthorizedZone(token);
                } else {
                    const response = await registerUser(email, password);
                    if (response.ok) {
                        const token = response.headers.get('X-Token');
                        token && openAuthorizedZone(token);
                        displayMessage('Thank You', 'To complete registration, please check your e-mail');
                    } else {
                        displayMessage('Oops, Sorry', 'Error during registration. Please try again.');
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                alert("There was an issue with the registration.");
            }
        });
    });

    closeButton.addEventListener("click", () => {
        dialog.close();
        overlay.style.display = 'none';
    });

    dialog.addEventListener("cancel", () => {
        dialog.close();
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        dialog.close();
        overlay.style.display = 'none';
    });

    const attemptLogin = async (email, password) => {
        const credentials = btoa(`${email}:${password}`);
        try {
            const response = await fetch('https://api.dating.com/identity', {
                method: 'GET',
                headers: { 'Authorization': `Basic ${credentials}` }
            });
            if (response.ok) {
                const token = response.headers.get('X-Token');
                token && openAuthorizedZone(token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during authorization:', error);
            return false;
        }
    };

    const registerUser = async (email, password) => {
        const requestBody = { "email": email, "password": password };
        return await fetch('https://api.dating.com/identity', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    };

    const getAuthToken = async (email, password) => {
        const credentials = btoa(`${email}:${password}`);
        try {
            const response = await fetch('https://api.dating.com/identity', {
                method: 'GET',
                headers: { 'Authorization': `Basic ${credentials}` }
            });
            return response.ok ? response.headers.get('X-Token') : null;
        } catch (error) {
            console.error('Error during token retrieval:', error);
            return null;
        }
    };

    const openAuthorizedZone = (token) => {
        const url = `https://www.dating.com/people/#token=${token}`;
        window.open(url, '_blank');
    };

    const displayMessage = (title, message) => {
        dialog.innerHTML = `
            <button class="close-button" aria-label="Close"></button>
            <h1 class="thank-you-title">${title}</h1>
            <p class="thank-you-message">${message}</p>
        `;
        const newCloseButton = dialog.querySelector(".close-button");
        newCloseButton.addEventListener("click", () => {
            dialog.close();
            overlay.style.display = 'none';
        });
    };
});
