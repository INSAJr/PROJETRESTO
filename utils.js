// Utilitaires génériques pour les dashboards SARAFINA

/**
 * Formate une date selon les paramètres locaux français
 * @param {string|Date} dateString - Date à formater
 * @returns {string} Date formatée
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Retourne un libellé de statut lisible
 * @param {string} status - Statut de la commande
 * @returns {string} Libellé du statut
 */
export function getStatusLabel(status) {
    const statusLabels = {
        'new-orders': 'Nouvelle',
        'preparing-orders': 'En préparation',
        'completed-orders': 'Terminée',
        'pending': 'En attente',
        'completed': 'Terminée'
    };
    return statusLabels[status] || status;
}

/**
 * Crée une carte de commande pour l'affichage
 * @param {Object} order - Détails de la commande
 * @param {Function} [updateStatusCallback] - Fonction de mise à jour du statut
 * @returns {HTMLDivElement} Élément de carte de commande
 */
export function createOrderCard(order, updateStatusCallback) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
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

    const orderTime = new Date(order.timestamp || order.created_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        <div class="order-header">
            <div class="order-info-header">
                <h3>Commande #${order.id}</h3>
                <div class="table-number">Table ${order.tableNumber || order.table_number}</div>
            </div>
            <span class="order-status status-${(order.status || 'new-orders').replace('-orders', '')}">${getStatusLabel(order.status || 'new-orders')}</span>
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
                <span class="total-amount">${order.total || order.total_amount} FCFA</span>
            </div>
        </div>
    `;

    // Ajouter des boutons de changement de statut si un callback est fourni
    if (updateStatusCallback && typeof updateStatusCallback === 'function') {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'order-actions';
        
        if (order.status !== 'completed-orders' && order.status !== 'completed') {
            if (order.status === 'new-orders' || order.status === 'pending') {
                const prepareButton = document.createElement('button');
                prepareButton.className = 'action-button prepare';
                prepareButton.textContent = 'Commencer la préparation';
                prepareButton.onclick = () => updateStatusCallback(order.id, 'preparing-orders');
                buttonsContainer.appendChild(prepareButton);
            }
            
            if (order.status === 'preparing-orders') {
                const completeButton = document.createElement('button');
                completeButton.className = 'action-button complete';
                completeButton.textContent = 'Marquer comme terminée';
                completeButton.onclick = () => updateStatusCallback(order.id, 'completed-orders');
                buttonsContainer.appendChild(completeButton);
            }
        }
        
        card.appendChild(buttonsContainer);
    }

    return card;
}

/**
 * Génère un identifiant unique
 * @returns {string} Identifiant unique
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formatte un montant en FCFA
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF' 
    }).format(amount);
}

/**
 * Valide un formulaire
 * @param {HTMLFormElement} form - Formulaire à valider
 * @returns {boolean} Résultat de la validation
 */
export function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid');
            isValid = false;
        } else {
            field.classList.remove('invalid');
        }
    });

    return isValid;
}

/**
 * Affiche une notification
 * @param {string} message - Message de la notification
 * @param {string} [type='info'] - Type de notification
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}