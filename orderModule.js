// Module de gestion des commandes pour Sarafina
import { apiRequest } from './apiModule.js';
import { showError } from '../components/uiModule.js';
import { formatDate } from './utils.js';

// État global des commandes
let currentOrders = [];
let orderUpdateCallbacks = [];

// Fonction pour s'abonner aux mises à jour des commandes
export function subscribeToOrderUpdates(callback) {
    orderUpdateCallbacks.push(callback);
}

// Fonction pour notifier tous les abonnés
function notifyOrderUpdate() {
    orderUpdateCallbacks.forEach(callback => callback(currentOrders));
}

// Fonction pour créer une nouvelle commande
export async function createNewOrder(orderData) {
    try {
        const order = await apiRequest('/orders', 'POST', {
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        currentOrders = [...currentOrders, order];
        notifyOrderUpdate();
        return order;
    } catch (error) {
        showError('Erreur lors de la création de la commande');
        throw error;
    }
}

// Fonction pour mettre à jour le statut d'une commande
export async function updateOrder(orderId, newStatus) {
    try {
        const updatedOrder = await apiRequest(`/orders/${orderId}`, 'PUT', {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        
        currentOrders = currentOrders.map(order => 
            order.id === orderId ? updatedOrder : order
        );
        notifyOrderUpdate();
        return updatedOrder;
    } catch (error) {
        showError('Erreur lors de la mise à jour de la commande');
        throw error;
    }
}

// Fonction pour récupérer toutes les commandes
export async function fetchAllOrders(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const orders = await apiRequest(`/orders?${queryParams}`);
        currentOrders = orders;
        notifyOrderUpdate();
        return orders;
    } catch (error) {
        showError('Erreur lors de la récupération des commandes');
        throw error;
    }
}

// Fonction pour calculer les statistiques des commandes
export function calculateOrderStats(orders) {
    return orders.reduce((stats, order) => {
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        stats.totalRevenue += total;
        stats.orderCount++;
        stats.averageOrderValue = stats.totalRevenue / stats.orderCount;
        return stats;
    }, { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 });
}

// Fonction pour formater une commande pour l'affichage
export function formatOrderForDisplay(order) {
    return {
        ...order,
        formattedDate: formatDate(order.createdAt),
        formattedTotal: `${order.total.toFixed(0)} FCFA`,
        statusLabel: getStatusLabel(order.status),
        items: order.items.map(item => ({
            ...item,
            formattedPrice: `${item.price.toFixed(0)} FCFA`,
            subtotal: item.price * item.quantity,
            formattedSubtotal: `${(item.price * item.quantity).toFixed(0)} FCFA`
        }))
    };
}

// Fonction pour obtenir le libellé du statut
export function getStatusLabel(status) {
    const statusLabels = {
        'pending': 'En attente',
        'preparing': 'En préparation',
        'ready': 'Prêt',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    return statusLabels[status] || status;
}

// Export des fonctions utilitaires
export const OrderUtils = {
    formatOrderForDisplay,
    calculateOrderStats,
    getStatusLabel
};
