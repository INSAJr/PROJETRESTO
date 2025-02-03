// Authentification sécurisée pour Sarafina

import { CONFIG } from './config.js';
import { showError } from '../components/uiModule.js';

// Fonction pour vérifier si l'utilisateur est authentifié
export function isAuthenticated() {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('authToken');
    
    if (userRole === 'admin') return true;
    if (userRole === 'cashier' && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    }
    return false;
}

// Fonction pour obtenir le rôle de l'utilisateur
export function getUserRole() {
    return localStorage.getItem('userRole');
}

// Fonction pour la connexion du caissier
export async function loginCashier(username, password) {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Identifiants invalides');
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('username', username);
        
        return true;
    } catch (error) {
        showError(error.message);
        return false;
    }
}

// Fonction pour l'accès direct de l'administrateur
export function directAdminAccess() {
    localStorage.setItem('userRole', 'admin');
    window.location.href = 'admin/admindashboard.html';
}

// Fonction de déconnexion
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = '../indexdash.html';
}

// Redirection basée sur le rôle
export function redirectToDashboard() {
    const role = getUserRole();
    switch(role) {
        case 'admin':
            window.location.href = 'admin/admindashboard.html';
            break;
        case 'cashier':
            window.location.href = 'cashier/cashierdashboard.html';
            break;
        default:
            window.location.href = 'indexdash.html';
    }
}

// Initialisation des gestionnaires d'événements
document.addEventListener('DOMContentLoaded', () => {
    // Gestionnaire pour le bouton d'accès administrateur
    const adminButton = document.getElementById('admin-access');
    if (adminButton) {
        adminButton.addEventListener('click', directAdminAccess);
    }

    // Gestionnaire pour le formulaire de connexion caissier
    const loginBtn = document.getElementById('cashier-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = document.getElementById('cashier-login').value;
            const password = document.getElementById('cashier-password').value;
            
            if (!username || !password) {
                showError('Veuillez saisir un identifiant et un mot de passe');
                return;
            }

            const success = await loginCashier(username, password);
            if (success) {
                redirectToDashboard();
            }
        });
    }
});