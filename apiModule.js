// Module API pour Sarafina
import { CONFIG } from './config.js';
import { isAuthenticated } from './authModule.js';
import { showError } from '../components/uiModule.js';

// Configuration de base pour les requêtes
const API_BASE_URL = CONFIG.API.BASE_URL;

// Gestionnaire d'erreurs centralisé
function handleApiError(error) {
    console.error('Erreur API:', error);
    
    let errorMessage;
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
    } else {
        errorMessage = error.message || CONFIG.ERROR_MESSAGES.SERVER_ERROR;
    }
    
    showError(errorMessage);
}

// Fonction de requête générique avec retry
async function apiRequest(endpoint, method = 'GET', data = null, retries = 2) {
    // Vérifier l'authentification sauf pour certains endpoints
    const publicEndpoints = ['/auth/login', '/auth/register'];
    if (!publicEndpoints.includes(endpoint) && !isAuthenticated()) {
        throw new Error(CONFIG.ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    };

    let lastError;
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || CONFIG.ERROR_MESSAGES.SERVER_ERROR);
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            if (i < retries) {
                // Attendre avant de réessayer (backoff exponentiel)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                continue;
            }
        }
    }

    handleApiError(lastError);
    throw lastError;
}

// Opérations sur les commandes
export async function fetchOrders(status = null) {
    let endpoint = `${CONFIG.API.ENDPOINTS.ORDERS}`;
    if (status) {
       endpoint += `?status=${status}`;
    }
      return await apiRequest(endpoint);
}

export async function createOrder(orderData) {
    return await apiRequest(CONFIG.API.ENDPOINTS.ORDERS, 'POST', orderData);
}

export async function saveOrders(orders) {
    return await apiRequest(CONFIG.API.ENDPOINTS.ORDERS + '/bulk', 'POST', { orders });
}

export async function updateOrderStatus(orderId, newStatus) {
    return await apiRequest(`${CONFIG.API.ENDPOINTS.ORDERS}/${orderId}/status`, 'PATCH', { status: newStatus });
}

// Opérations sur les utilisateurs
export async function fetchUsers(role = null) {
    let endpoint = CONFIG.API.ENDPOINTS.USERS;
    if (role) {
        endpoint += `?role=${role}`;
    }
    return await apiRequest(endpoint);
}

export async function createUser(userData) {
    return await apiRequest(CONFIG.API.ENDPOINTS.USERS, 'POST', userData);
}

// Statistiques
export async function fetchDailyStats(date = null) {
    let endpoint = `${CONFIG.API.ENDPOINTS.STATS}/daily`;
    if (date) {
        endpoint += `?date=${date}`;
    }
    return await apiRequest(endpoint);
}

export async function fetchMonthlyStats(month = null) {
    let endpoint = `${CONFIG.API.ENDPOINTS.STATS}/monthly`;
    if (month) {
        endpoint += `?month=${month}`;
    }
    return await apiRequest(endpoint);
}

export { showError };