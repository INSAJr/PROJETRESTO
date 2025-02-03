// Design System et Interactions pour Dashboard Caissier
class CashierDashboard {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    initializeVariables() {
        this.ordersContainer = document.querySelector('.orders-grid');
        this.navItems = document.querySelectorAll('.nav-item');
        this.userInfoSection = document.querySelector('.user-info');
        this.logoutButton = document.getElementById('logout-btn');
        this.currentOrders = [];
    }

    setupEventListeners() {
        this.navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation.bind(this));
        });

        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }

        document.addEventListener('DOMContentLoaded', this.loadInitialData.bind(this));
    }

    initializeAnimations() {
        this.animateUserInfo();
        this.animateOrderCards();
    }

    animateUserInfo() {
        if (this.userInfoSection) {
            this.userInfoSection.style.opacity = '0';
            this.userInfoSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.userInfoSection.style.transition = 'all 0.5s ease';
                this.userInfoSection.style.opacity = '1';
                this.userInfoSection.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    animateOrderCards() {
        const orderCards = this.ordersContainer.querySelectorAll('.order-card');
        orderCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, index * 150);
        });
    }

    handleNavigation(event) {
        const targetSection = event.currentTarget.dataset.section;
        
        this.navItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        const sections = document.querySelectorAll('.orders-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const activeSection = document.getElementById(targetSection);
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.fetchAllOrders(),
                this.loadHistory(),
                this.loadDailyReport()
            ]);
            
            this.updateTime();
            this.setupPeriodicUpdates();
        } catch (error) {
            console.error('Erreur lors du chargement initial :', error);
        }
    }

    setupPeriodicUpdates() {
        setInterval(() => {
            this.updateTime();
            this.fetchAllOrders();
        }, 60000); // Mise à jour toutes les minutes
    }

    async handleLogout() {
        try {
            // Implémentation de la déconnexion
            await logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    }

    async fetchAllOrders(filters = {}) {
        try {
            let url = 'http://localhost/sarafina/backend/api/orders/get_orders.php';
            
            // Ajouter les filtres à l'URL si présents
            if (Object.keys(filters).length > 0) {
                const queryParams = new URLSearchParams(filters);
                url += `?${queryParams.toString()}`;
            }

            const response = await fetch(url);
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

    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch('http://localhost/sarafina/backend/api/orders/update_status.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
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
            this.currentOrders = await this.fetchAllOrders({ status: 'pending' });
            this.updateOrdersDisplay(this.currentOrders);
            
            showConfirmation('Statut mis à jour avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            showError('Erreur lors de la mise à jour du statut');
        }
    }

    updateOrdersDisplay(orders) {
        this.ordersContainer.innerHTML = '';
        orders.forEach(order => {
            const card = createOrderCard(order, this.updateOrderStatus.bind(this));
            this.ordersContainer.appendChild(card);
        });

        // Mettre à jour le compteur
        const countElement = document.querySelector('.orders-count');
        if (countElement) {
            const pendingCount = orders.filter(order => order.status === 'pending').length;
            countElement.textContent = pendingCount.toString();
        }
    }

    async loadOrders() {
        try {
            const orders = await this.fetchAllOrders({ status: 'pending' });
            this.updateOrdersDisplay(orders);
        } catch (error) {
            showError('Impossible de charger les commandes');
            console.error(error);
        }
    }

    async initializeOrdersView() {
        try {
            this.currentOrders = await this.fetchAllOrders({ status: 'pending' });
            this.updateOrdersDisplay(this.currentOrders);
            
            // Actualisation automatique
            setInterval(async () => {
                this.currentOrders = await this.fetchAllOrders({ status: 'pending' });
                this.updateOrdersDisplay(this.currentOrders);
            }, 30000);
        } catch (error) {
            showError('Erreur lors du chargement des commandes');
            console.error(error);
        }
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('fr-FR');
        }
    }

    async loadHistory() {
        const orders = await this.fetchAllOrders();
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

    async loadDailyReport() {
        const orders = await this.fetchAllOrders();
        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => 
            new Date(order.created_at).toDateString() === today
        );

        const totalSales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        const orderCount = todayOrders.length;
        const averageTicket = orderCount > 0 ? totalSales / orderCount : 0;

        // Mise à jour des statistiques
        const statsElements = {
            totalSales: document.getElementById('total-sales'),
            orderCount: document.getElementById('order-count'),
            averageTicket: document.getElementById('average-ticket')
        };

        if (statsElements.totalSales) {
            statsElements.totalSales.textContent = `${totalSales.toLocaleString()} FCFA`;
        }
        if (statsElements.orderCount) {
            statsElements.orderCount.textContent = orderCount.toString();
        }
        if (statsElements.averageTicket) {
            statsElements.averageTicket.textContent = `${averageTicket.toLocaleString()} FCFA`;
        }

        // Liste des commandes du jour
        const ordersList = document.getElementById('daily-orders');
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
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new CashierDashboard();
});