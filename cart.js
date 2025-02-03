class CartManager {
    constructor() {
        this.cartItems = this.loadCart();
        this.cartModal = document.getElementById('cart-modal');
        this.cartButton = document.getElementById('cart-button');
        this.closeCartButton = document.getElementById('close-cart-modal');
        
        this.initializeEvents();
        this.updateCartDisplay();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('sarafina-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Erreur de chargement du panier:', error);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('sarafina-cart', JSON.stringify(this.cartItems));
            localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
            localStorage.setItem('cartTotal', this.calculateTotal().toString());
        } catch (error) {
            console.error('Erreur de sauvegarde du panier:', error);
        }
    }

    initializeEvents() {
        // Gestion de l'ouverture du modal
        if (this.cartButton) {
            this.cartButton.addEventListener('click', () => this.openCartModal());
        }

        // Gestion de la fermeture du modal
        if (this.closeCartButton) {
            this.closeCartButton.addEventListener('click', () => this.closeCartModal());
        }

        // Fermeture du modal en cliquant en dehors
         if (this.cartModal) {
            this.cartModal.addEventListener('click', (event) => {
                if (event.target === this.cartModal) {
                    this.closeCartModal();
                }
            });
        }

        // Ajouter des événements pour les boutons d'ajout au panier
        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                e.preventDefault();
                const item = {
                    id: this.generateUniqueId(),
                    name: addToCartBtn.dataset.name,
                    price: parseInt(addToCartBtn.dataset.price),
                    image: addToCartBtn.dataset.image,
                    quantity: 1
                };
                this.addToCart(item);
            }
        });

        // Gestion des boutons + et -
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.addEventListener('click', (event) => {
                const quantityBtn = event.target.closest('.cart-quantity-btn');
                if (!quantityBtn) return;

                const itemId = quantityBtn.getAttribute('data-id');
                const action = quantityBtn.getAttribute('data-action');
                
                this.updateItemQuantity(itemId, action);
            });
        }

        // Bouton de vidage du panier
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Bouton de passage de commande
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.processOrder());
        }
    }

    generateUniqueId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    addToCart(item) {
        const existingItemIndex = this.cartItems.findIndex(
            cartItem => cartItem.name === item.name && cartItem.price === item.price
        );

        if (existingItemIndex !== -1) {
            // Augmenter la quantité si l'article existe déjà
            this.cartItems[existingItemIndex].quantity += 1;
        } else {
            // Ajouter un nouvel article
            this.cartItems.push({
                ...item,
                quantity: 1,
                image: this.normalizeImagePath(item.image)
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Article ajouté au panier');
    }

    normalizeImagePath(imagePath) {
        // S'assurer que le chemin de l'image est correct
        return imagePath.startsWith('assets/') 
            ? imagePath 
            : `assets/images/${imagePath.split('/').pop()}`;
    }

    updateItemQuantity(itemId, action) {
        const itemIndex = this.cartItems.findIndex(item => item.id.toString() === itemId);
        if (itemIndex === -1) return;

        if (action === 'increase') {
            this.cartItems[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            if (this.cartItems[itemIndex].quantity > 1) {
                this.cartItems[itemIndex].quantity -= 1;
            } else {
                // Supprimer l'article si la quantité est 1
                this.cartItems.splice(itemIndex, 1);
            }
        }

        this.saveCart();
        this.updateCartDisplay();
    }

    clearCart() {
        this.cartItems = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Panier vidé');
    }

    calculateTotal() {
        return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items-compact');
        const cartTotalElement = document.getElementById('cart-total-compact');
        const emptyCartMessage = document.querySelector('.cart-modal__empty');
        const cartActions = document.querySelector('.cart-modal__actions-compact');
    
        // Vider le conteneur
        if(cartItemsContainer){
           cartItemsContainer.innerHTML = '';
        }
    
        if (this.cartItems.length === 0) {
            // Afficher le message de panier vide
             if(emptyCartMessage){
                 emptyCartMessage.style.display = 'block';
            }
             if(cartActions){
                 cartActions.style.display = 'none';
             }
              if(cartTotalElement) {
                  cartTotalElement.textContent = '0 FCFA';
              }
             if(this.cartButton){
                  this.cartButton.setAttribute('data-empty', true);
              }
            return;
        }
        if(this.cartButton){
             this.cartButton.setAttribute('data-empty', false);
        }
         if(emptyCartMessage){
              emptyCartMessage.style.display = 'none';
         }
         if(cartActions){
                cartActions.style.display = 'flex';
            }
          if(cartItemsContainer){
              this.cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-modal__item-compact';
            itemElement.innerHTML = `
                <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-modal__item-image">
                 <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${this.formatPrice(item.price)}</span>
                    <div class="cart-item-quantity">
                        <button class="cart-quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="cart-quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                 </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Mise à jour du total
    if(cartTotalElement) {
        cartTotalElement.textContent = this.formatPrice(this.calculateTotal());
    }

    // Mise à jour du compteur de panier
    if(this.cartButton) {
        const cartCount = this.cartButton.querySelector('.cart-count');
        if(cartCount) {
            cartCount.textContent = this.cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.style.display = this.cartItems.length > 0 ? 'flex' : 'none';
        }
    }
}

formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

    openCartModal() {
       if (this.cartModal) {
            this.cartModal.classList.add('is-open');
            this.cartModal.style.display = 'flex';
           document.body.style.overflow = 'hidden';

            // Optional: Trigger a reflow
            this.cartModal.offsetHeight; 
        }
    }

    closeCartModal() {
         if (this.cartModal) {
            this.cartModal.classList.remove('is-open');
            this.cartModal.style.display = 'none';
            document.body.style.overflow = '';

        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 10);
    }

    processOrder() {
        // Générer les données de commande
        const orderData = {
            tableNumber: this.getSelectedTableNumber() || 'Non spécifié',
            items: this.cartItems,
            total: this.calculateTotal(),
            date: new Date().toLocaleDateString('fr-FR')
        };

        // Stocker les données de commande
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        localStorage.setItem('cartTotal', this.calculateTotal().toString());

        // Rediriger vers la page de paiement
        window.location.href = 'payment.html';
    }

    getSelectedTableNumber() {
        // Récupérer le numéro de table sélectionné (à adapter selon votre implémentation)
        const tableSelect = document.getElementById('table-select');
        return tableSelect ? tableSelect.value : null;
    }

    retrieveOrderData() {
        try {
            const orderData = localStorage.getItem('currentOrder');
            if (orderData) {
                return JSON.parse(orderData);
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération des données de commande:', error);
            return null;
        }
    }

    sendOrderToKitchen(orderData) {
        // Simuler l'envoi de la commande (remplacer par un appel API réel)
        console.log('Commande envoyée :', orderData);
        alert(`Commande pour la table ${orderData.tableNumber} envoyée avec succès !`);
        this.clearCart();
        this.closeCartModal();
    }
}

// Initialiser le gestionnaire de panier
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});