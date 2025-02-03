// Design System et Animations pour Dashboard Admin
class AdminDashboard {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    initializeVariables() {
        this.statsContainer = document.querySelector('.stats-grid');
        this.ordersContainer = document.querySelector('.orders-grid');
        this.navItems = document.querySelectorAll('.nav-item');
        this.sections = document.querySelectorAll('.orders-section');
    }

    setupEventListeners() {
        this.navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation.bind(this));
        });

        document.addEventListener('DOMContentLoaded', this.loadInitialData.bind(this));
    }

    initializeAnimations() {
        this.animateStatsCards();
        this.animateOrderCards();
    }

    animateStatsCards() {
        const statsCards = this.statsContainer.querySelectorAll('.stat-card');
        statsCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
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
        
        this.sections.forEach(section => {
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
                this.loadOrders(),
                this.loadEmployeeList(),
                this.calculateStats('monthly')
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
            this.loadOrders();
        }, 60000); // Mise à jour toutes les minutes
    }

    loadOrders() {
        const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const ordersGrid = document.querySelector('#new-orders .orders-grid');
        if (ordersGrid) {
            ordersGrid.innerHTML = '';
            orders.forEach(order => {
                const orderCard = this.createOrderCard(order);
                ordersGrid.appendChild(orderCard);
            });
        }
        this.updateOrderCounts(orders);
    }

    updateOrderCounts(orders) {
        const counts = {
            'new-orders': 0,
            'preparing-orders': 0,
            'completed-orders': 0
        };

        orders.forEach(order => {
            let status = order.status || 'new-orders';
            if (counts.hasOwnProperty(status)) {
                counts[status]++;
            }
        });

        Object.keys(counts).forEach(status => {
            const counter = document.querySelector(`#${status} .orders-count`);
            if (counter) {
                counter.textContent = counts[status];
            }
        });
    }

    loadEmployeeList() {
        const employeeList = document.getElementById('employee-list');
        if (employeeList) {
            const employees = JSON.parse(localStorage.getItem('employees')) || [];
            employeeList.innerHTML = employees.map(employee => `
                <li class="employee-item">
                    <div class="employee-info">
                        <span class="employee-name">${employee.name}</span>
                        <span class="employee-role">${employee.role}</span>
                    </div>
                    <button class="remove-employee" data-id="${employee.id}">×</button>
                </li>
            `).join('');
        }
    }

    calculateStats(period) {
        const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const now = new Date();
        const stats = {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0
        };

        orders.forEach(order => {
            const orderDate = new Date(order.timestamp);
            if (this.isOrderInPeriod(orderDate, now, period)) {
                stats.totalOrders++;
                stats.totalRevenue += parseFloat(order.total || 0);
                if (order.status === 'completed-orders') {
                    stats.completedOrders++;
                } else {
                    stats.pendingOrders++;
                }
            }
        });

        // Mettre à jour l'affichage des statistiques
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-revenue-stats').textContent = `${stats.totalRevenue} FCFA`;
        document.getElementById('pending-orders-stats').textContent = stats.pendingOrders;
        document.getElementById('completed-orders-stats').textContent = stats.completedOrders;
    }

    isOrderInPeriod(orderDate, now, period) {
        switch (period) {
            case 'day':
                return orderDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            case 'month':
                return orderDate.getMonth() === now.getMonth() && 
                       orderDate.getFullYear() === now.getFullYear();
            case 'year':
                return orderDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    }

    createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        const statusLabel = {
            'new-orders': 'Nouvelle',
            'preparing-orders': 'En préparation',
            'completed-orders': 'Terminée'
        };

        const itemsHtml = order.items.map(item => {
            const imagePath = item.image || '../images/placeholder.jpg';
            const fullImagePath = imagePath.startsWith('http') ? imagePath : 
                                imagePath.startsWith('/') ? imagePath : 
                                `../${imagePath}`;
        
            return `
                <div class="order-item">
                    <div class="item-details">
                        <div class="item-image-container">
                            <img src="${fullImagePath}" 
                                 alt="${item.name}" 
                                 class="item-image"
                                 onerror="this.onerror=null; this.src='../images/placeholder.jpg';">
                        </div>
                        <div class="item-info">
                            <h4 class="item-name">${item.name}</h4>
                            <span class="item-price">${item.price} FCFA</span>
                        </div>
                        <span class="item-quantity">×${item.quantity}</span>
                    </div>
                </div>
            `;
        }).join('');

        const orderTime = new Date(order.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="order-header">
                <div class="order-info-header">
                    <h3>Commande #${order.id}</h3>
                    <div class="table-number">Table ${order.tableNumber}</div>
                </div>
                <span class="order-status status-${(order.status || 'new-orders').replace('-orders', '')}">${statusLabel[order.status || 'new-orders']}</span>
            </div>
            <div class="order-details">
                <div class="order-info">
                    <div class="info-item">
                        <span class="info-label">Heure:</span>
                        <span class="info-value">${orderTime}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                <div class="order-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount">${order.total} FCFA</span>
                </div>
            </div>
        `;

        // Ajouter les boutons de changement de statut
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'order-actions';
        
        if (order.status !== 'completed-orders') {
            if (order.status === 'new-orders') {
                const prepareButton = document.createElement('button');
                prepareButton.className = 'action-button prepare';
                prepareButton.textContent = 'Commencer la préparation';
                prepareButton.onclick = () => this.changeOrderStatus(order.id, 'preparing-orders');
                buttonsContainer.appendChild(prepareButton);
            }
        
            if (order.status === 'preparing-orders') {
                const completeButton = document.createElement('button');
                completeButton.className = 'action-button complete';
                completeButton.textContent = 'Marquer comme terminée';
                completeButton.onclick = () => this.changeOrderStatus(order.id, 'completed-orders');
                buttonsContainer.appendChild(completeButton);
            }
        }
    
        card.appendChild(buttonsContainer);
        return card;
    }

    changeOrderStatus(orderId, newStatus) {
        const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('allOrders', JSON.stringify(orders));
            this.loadOrders(); // Recharger les commandes pour mettre à jour l'affichage
        }
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('fr-FR');
        }
    }

    updateRevenueChart(orders) {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) {
            console.error("Canvas 'revenue-chart' non trouvé.");
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Impossible d'obtenir le contexte 2D du canvas.");
            return;
        }

        // Supprimer le graphique précédent
        if (window.revenueChart) {
            window.revenueChart.destroy();
        }

        const labels = [];
        const data = [];
        
        // Regrouper les commandes par jour ou par mois en fonction de la période
        const period = document.getElementById('stats-period').value;
        const groupedOrders =  {};
        orders.forEach(order => {
            const date = new Date(order.timestamp);
            let key;
            if (period === 'day') {
                key = date.toLocaleTimeString('fr-FR',{hour: '2-digit',minute: '2-digit'});
            } else if (period === 'week') {
                key = date.toLocaleDateString('fr-FR', { weekday: 'short'});
            }else if (period === 'month') {
                key = date.toLocaleDateString('fr-FR', { month: 'short'});
            }else{
                key = date.toLocaleDateString('fr-FR', { month: 'short' ,year:'numeric'});
            }

            if (!groupedOrders[key]) {
                groupedOrders[key] = 0;
            }
            groupedOrders[key] += (order.totalAmount || order.total);
        });
        
        // Trier les dates
        const sortedKeys = Object.keys(groupedOrders).sort();

        sortedKeys.forEach(key => {
            labels.push(key);
            data.push(groupedOrders[key]);
        });
        
        window.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenus (FCFA)',
                    data: data,
                    backgroundColor: 'rgba(212, 175, 55, 0.5)',
                    borderColor: 'rgba(212, 175, 55, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});