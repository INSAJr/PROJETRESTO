// Fonction pour afficher un message d'erreur
export function showError(message) {
    // Créer un conteneur d'erreur s'il n'existe pas
    let errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-container';
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        `;
        document.body.appendChild(errorContainer);
    }

    // Afficher le message d'erreur
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';

    // Masquer après 5 secondes
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Function to show a confirmation message
export function showConfirmation(message, container = document.body) {
    const confirmationElement = document.createElement('div');
    confirmationElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
    `;
    confirmationElement.textContent = message;
    container.appendChild(confirmationElement);

    setTimeout(() => {
        container.removeChild(confirmationElement);
    }, 3000);
}