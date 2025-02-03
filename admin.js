// Importation des modules nécessaires
import { createOrderCard, getStatusLabel, formatDate } from './utils.js';
import { showConfirmation, showError } from '../components/uiModule.js';
import { checkAuth, logout } from './auth.js';

// État local
let currentOrders = [];

// Fonction pour récupérer toutes les commandes
async function fetchAllOrders(filters = {}) {
    try {
        let url = 'http://localhost/sarafina/backend/api/orders/get_orders.php';
        
        // Ajouter les filtres à l'URL si présents
        if (Object.keys(filters).length > 0) {
            const queryParams = new URLSearchParams(filters);
            url += `?${queryParams.toString()}`;
        }
         const token = localStorage.getItem('token');
        const response = await fetch(url,{
             headers: {
               'Authorization': `Bearer ${token}`
             }
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des commandes');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Erreur lors de la récupération des commandes');
        }
        
        return result.orders;
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        showError('Impossible de récupérer les commandes');
        return [];
    }
}

// Fonction pour mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost/sarafina/backend/api/orders/update_status.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: orderId,
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du statut');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Erreur lors de la mise à jour du statut');
        }

        // Rafraîchir les commandes après la mise à jour
        currentOrders = await fetchAllOrders({ status: 'pending' });
        updateOrdersDisplay(currentOrders);
        
        showConfirmation('Statut mis à jour avec succès');
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors de la mise à jour du statut');
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    // Vérification de l'authentification
    const cashier = checkAuth();
    if (!cashier) return;

    // Affichage du nom du caissier
    const cashierName = document.getElementById('cashier-name');
    if (cashierName) {
        cashierName.textContent = cashier.name;
    }

    // Initialisation des composants
    setupTabHandlers();
    await initializeOrdersView();
    updateTime();
    setInterval(updateTime, 60000);

    // Gestionnaire de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Gestion des onglets
function setupTabHandlers() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.orders-section');

    navItems.forEach(item => {
        item.addEventListener('click', async () => {
            // Désactiver tous les onglets
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.style.display = 'none');

            // Activer l'onglet sélectionné
            item.classList.add('active');
            const sectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                targetSection.style.display = 'block';
                
                try {
                    switch(sectionId) {
                        case 'orders':
                            await loadOrders();
                            break;
                        case 'history':
                            await loadHistory();
                            break;
                        case 'daily-report':
                            await loadDailyReport();
                            break;
                    }
                } catch (error) {
                    showError('Erreur lors du chargement des données');
                    console.error(error);
                }
            }
        });
    });
}

// Mise à jour de l'affichage des commandes
function updateOrdersDisplay(orders) {
    const ordersContainer = document.querySelector('.orders-grid');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = '';
    orders.forEach(order => {
        const card = createOrderCard(order, updateOrderStatus);
        ordersContainer.appendChild(card);
    });

    // Mettre à jour le compteur
    const countElement = document.querySelector('.orders-count');
    if (countElement) {
        const pendingCount = orders.filter(order => order.status === 'pending').length;
        countElement.textContent = pendingCount.toString();
    }
}

// Chargement des commandes
async function loadOrders() {
    try {
        const orders = await fetchAllOrders({ status: 'pending' });
        updateOrdersDisplay(orders);
    } catch (error) {
        showError('Impossible de charger les commandes');
        console.error(error);
    }
}

// Initialisation de la vue des commandes
async function initializeOrdersView() {
    try {
        currentOrders = await fetchAllOrders({ status: 'pending' });
        updateOrdersDisplay(currentOrders);
        
        // Actualisation automatique
        setInterval(async () => {
            currentOrders = await fetchAllOrders({ status: 'pending' });
            updateOrdersDisplay(currentOrders);
        }, 30000);
    } catch (error) {
        showError('Erreur lors du chargement des commandes');
        console.error(error);
    }
}

// Mise à jour de l'heure
function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('fr-FR');
    }
}

// Chargement de l'historique
async function loadHistory() {
   const orders = await fetchAllOrders();
    const historyGrid = document.querySelector('.history-grid');
    if (!historyGrid) return;
    
    const now = new Date();
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(now.setDate(now.getDate() - 7));
    });

    historyGrid.innerHTML = filteredOrders.map(order => `
        <div class="history-card">
            <div class="history-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-date">${formatDate(order.created_at)}</span>
            </div>
            <div class="history-content">
                <p>Table ${order.table_number}</p>
                 <p>Mode de paiement: ${order.payment_method}</p>
                <div class="history-items">
                    ${order.items.map(item => `
                        <div class="history-item">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>${item.price * item.quantity} FCFA</span>
                        </div>
                    `).join('')}
                </div>
                <div class="history-footer">
                    <span class="total-amount">Total: ${order.total_amount} FCFA</span>
                    <span class="status ${order.status}">${getStatusLabel(order.status)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Chargement du rapport journalier
async function loadDailyReport() {
     const orders = await fetchAllOrders();
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
    );

    const totalSales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const orderCount = todayOrders.length;
    const averageTicket = orderCount > 0 ? totalSales / orderCount : 0;
     // Mise à jour des statistiques
     const dailySalesElement = document.getElementById('daily-sales');
        const dailyOrdersCountElement = document.getElementById('daily-orders-count');
        const averageTicketElement = document.getElementById('average-ticket');

       if(dailySalesElement){
            dailySalesElement.textContent = `${totalSales.toLocaleString()} FCFA`;
       }
       if(dailyOrdersCountElement){
            dailyOrdersCountElement.textContent = orderCount.toString();
       }
         if(averageTicketElement){
            averageTicketElement.textContent = `${averageTicket.toLocaleString()} FCFA`;
       }

    // Liste des commandes du jour
    const ordersList = document.getElementById('daily-orders-list');
    if (ordersList) {
        ordersList.innerHTML = todayOrders.map(order => `
            <div class="daily-order-item">
                <div class="daily-order-header">
                    <span>#${order.id}</span>
                    <span>${formatDate(order.created_at)}</span>
                    <span>${order.total_amount} FCFA</span>
                </div>
                <div class="daily-order-details">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>${item.price * item.quantity} FCFA</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}