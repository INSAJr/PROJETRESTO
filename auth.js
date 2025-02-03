// Fonctions d'authentification pour le caissier
import { CONFIG } from './config.js';
import { showError } from '../components/uiModule.js';

// Fonction pour vérifier l'authentification du caissier
export function checkAuth() {
    const token = localStorage.getItem('token');
    const cashier = localStorage.getItem('cashier');

    if (!token || !cashier) {
        window.location.href = '../login.html';
        return false;
    }

    try {
        const cashierData = JSON.parse(cashier);
        if (!cashierData.id || !cashierData.name) {
            throw new Error('Données de session invalides');
        }
        return cashierData;
    } catch (error) {
        console.error('Erreur de session:', error);
        logout();
        return false;
    }
}

// Fonction de connexion du caissier
export async function login(username, password) {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role: 'cashier' })
        });

        if (!response.ok) {
            throw new Error('Échec de la connexion');
        }

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('cashier', JSON.stringify(data.cashier));
            return true;
        } else {
            throw new Error(data.message || 'Échec de la connexion');
        }
    } catch (error) {
        showError(error.message);
        return false;
    }
}

// Fonction de déconnexion
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('cashier');
    window.location.href = '../login.html';
}
