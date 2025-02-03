// Fonction de confirmation locale
function showConfirmation(message) {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'confirmation-modal';
    confirmationModal.innerHTML = `
        <div class="confirmation-content">
            <p>${message}</p>
            <button class="confirmation-close">Fermer</button>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    const closeButton = confirmationModal.querySelector('.confirmation-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(confirmationModal);
    });

    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        if (document.body.contains(confirmationModal)) {
            document.body.removeChild(confirmationModal);
        }
    }, 5000);
}

// Classe de gestion du paiement
class Payment {
    constructor() {
        this.form = document.getElementById('payment-form');
        this.totalAmount = 0;
        this.init();
        this.selectedPaymentMethod = null;
    }

    init() {
        // Récupérer le montant total du panier
       this.totalAmount = parseFloat(localStorage.getItem('cartTotal')) || 0;
        this.displayAmount();
        this.initFormListeners();
        this.setupPaymentMethods();
        // Afficher les détails de la commande
        const orderData = retrieveOrderData();
       if (orderData) {
          displayOrderDetails(orderData);
       }
    }

    displayAmount() {
       const amountElement = document.getElementById('order-total-display');
       if (amountElement) {
           amountElement.textContent = formatPrice(this.totalAmount);
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


    initFormListeners() {
          const confirmPaymentButton = document.getElementById('confirm-payment');
         if(confirmPaymentButton) {
               confirmPaymentButton.addEventListener('click', (e) => this.handleSubmit(e));
        }
        const cardNumber = document.getElementById('card-number');
        const expiryDate = document.getElementById('expiry-date');
        const cvv = document.getElementById('cvv');

            if (cardNumber) {
                cardNumber.addEventListener('input', (e) => this.formatCardNumber(e.target));
            }
            if (expiryDate) {
                expiryDate.addEventListener('input', (e) => this.formatExpiryDate(e.target));
            }
            if (cvv) {
                cvv.addEventListener('input', (e) => this.formatCVV(e.target));
            }
    }
  setupPaymentMethods() {
    const paymentMethodButtons = document.querySelectorAll('.payment-method');

    paymentMethodButtons.forEach(button => {
        button.addEventListener('click', () => {
             // Retirer la classe selected de tout les buttons
                paymentMethodButtons.forEach(btn => btn.classList.remove('selected'));
            //Ajouter au button selectionner
                button.classList.add('selected');
            this.selectedPaymentMethod = button.querySelector('input').value;
          });
        });
    }

    formatCardNumber(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        input.value = value.substring(0, 19); // 16 digits + 3 spaces
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        input.value = value.substring(0, 5); // MM/YY
    }

    formatCVV(input) {
        let value = input.value.replace(/\D/g, '');
        input.value = value.substring(0, 3);
    }

    validateForm() {
        const cardNumber = document.getElementById('card-number')?.value?.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiry-date')?.value;
        const cvv = document.getElementById('cvv')?.value;
        const name = document.getElementById('card-name')?.value;
          if (this.selectedPaymentMethod === 'cash') return true;
        if (!this.validateCardNumber(cardNumber)) {
            this.showError('Numéro de carte invalide');
            return false;
        }

        if (!this.validateExpiryDate(expiryDate)) {
            this.showError('Date d\'expiration invalide');
            return false;
        }

        if (!this.validateCVV(cvv)) {
            this.showError('CVV invalide');
            return false;
        }

        if (!name?.trim()) {
            this.showError('Nom du titulaire requis');
            return false;
        }

        return true;
    }

    validateCardNumber(number) {
        return number?.length === 16 && /^\d+$/.test(number);
    }

    validateExpiryDate(date) {
        if (!/^\d{2}\/\d{2}$/.test(date)) return false;

        const [month, year] = date.split('/').map(num => parseInt(num, 10));
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        return month >= 1 && month <= 12 && 
               year >= currentYear && 
               (year > currentYear || month >= currentMonth);
    }

    validateCVV(cvv) {
        return /^\d{3}$/.test(cvv);
    }

    showError(message) {
        const errorDiv = document.getElementById('payment-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    async handleSubmit(e) {
       e.preventDefault();

         if (!this.selectedPaymentMethod) {
                this.showError('Veuillez sélectionner une méthode de paiement');
               return;
            }
         if (!this.validateForm()) {
                return;
          }

             this.processPayment();
    }
   processPayment() {
         if(this.selectedPaymentMethod === 'cash') {
            showConfirmation(`Veuillez attendre votre reçu pour payer la somme de :  ${localStorage.getItem('cartTotal')} FCFA`);
             localStorage.removeItem('currentOrder');
              window.location.href = 'index.html?payment=success';
            }
           else  if (this.selectedPaymentMethod === 'wave'){
             const waveUrl = "https://www.wave.com/";
              localStorage.removeItem('currentOrder');
               window.location.href = waveUrl;
       
       }
           else if (this.selectedPaymentMethod ==='orange-money'){
             const orangeMoneyUrl = "https://www.orangemoney.com/";
               localStorage.removeItem('currentOrder');
                 window.location.href = orangeMoneyUrl;
           }
    }
}
function retrieveOrderData() {
    try {
        const orderData = localStorage.getItem('currentOrder');
        return orderData ? JSON.parse(orderData) : null;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de commande:', error);
        return null;
    }
}

function displayOrderDetails(orderData) {
    // Afficher le numéro de table
    const tableNumberDisplay = document.getElementById('table-number-display');
    if (tableNumberDisplay) {
        tableNumberDisplay.textContent = orderData?.tableNumber || "Non spécifié";
    }

    // Afficher la date de commande
    const orderDateDisplay = document.getElementById('order-date-display');
    if (orderDateDisplay) {
        const formattedDate = orderData?.date 
            ? formatSimpleDate(orderData.date) 
            : formatSimpleDate(new Date());
        orderDateDisplay.textContent = formattedDate;
    }

    // Afficher les articles de la commande
    const orderItemsContainer = document.getElementById('order-items');
    if (orderItemsContainer && orderData?.items) {
        orderItemsContainer.innerHTML = ''; // Vider le conteneur
        orderData.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="order-item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="order-item-image">
                </div>
                <div class="order-item-details">
                    <div class="order-item-header">
                        <span class="order-item-name">${item.name}</span>
                        <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <span class="order-item-quantity">Quantité : ${item.quantity}</span>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }

    // Afficher le total
    const orderTotalDisplay = document.getElementById('order-total-display');
    if (orderTotalDisplay) {
        orderTotalDisplay.textContent = formatPrice(orderData?.total || 0);
        orderTotalDisplay.classList.add('animated-price');
    }
}

function formatSimpleDate(date) {
    const options = {
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Ajout d'une fonction pour supprimer l'article
function removeCartItem(index) {
    try {
       // Recuperer le panier
        const cart = JSON.parse(localStorage.getItem('sarafina-cart'));

        // Supprimer l'article à l'index donné
        if(cart && index >= 0 && index < cart.length) {
          cart.splice(index,1);
           localStorage.setItem('sarafina-cart',JSON.stringify(cart))
           localStorage.setItem('cartTotal', calculateTotal(cart).toString());
          
           const orderData = retrieveOrderData()
            if(orderData) {
                 orderData.items = cart
                  orderData.total = calculateTotal(cart)
                  localStorage.setItem('currentOrder',JSON.stringify(orderData))
            }
           displayOrderDetails(retrieveOrderData())
        }
        else {
             throw new Error('Erreur')
        }

    } catch (error) {
        console.error('Erreur lors de la suppression du panier:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}
   //Fonction pour recalculer le total
    function calculateTotal(cartItems) {
           if(cartItems && cartItems.length > 0) {
             return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
           }
            return 0;
      }
  // Fonction pour formater les prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}
document.addEventListener('DOMContentLoaded', () => {
    const orderData = retrieveOrderData();
    
    if (orderData) {
         displayOrderDetails(orderData);
    } else {
        console.warn('Aucune commande trouvée dans le stockage local.');
        window.location.href = 'index.html';
    }
    new Payment();
    // Initialisation du gestionnaire de panier
    if (window.cartManager) {
        window.cartManager.updateCartDisplay();
    }
});