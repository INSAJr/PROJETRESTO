// Gestionnaire du menu
class Menu {
    constructor() {
        this.platsData = [];
        this.boissonsData = [];
        this.init();
    }

    async init() {
        try {
            await this.loadMenuData();
            this.renderMenu();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    async loadMenuData() {
        try {
            const response = await fetch('../assets/data/menu.json');
            if (!response.ok) {
                throw new Error('Impossible de charger les données du menu');
            }
            const data = await response.json();
            this.platsData = data.plats || [];
            this.boissonsData = data.boissons || [];
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    renderMenu() {
        // Rendu des plats
        const platsRow1 = document.getElementById('plats-row-1');
        const platsRow2 = document.getElementById('plats-row-2');
        if (platsRow1 && platsRow2) {
            const midPoint = Math.ceil(this.platsData.length / 2);
            this.renderItems(this.platsData.slice(0, midPoint), platsRow1);
            this.renderItems(this.platsData.slice(midPoint), platsRow2);
        }

        // Rendu des boissons
        const boissonsRow1 = document.getElementById('boissons-row-1');
        const boissonsRow2 = document.getElementById('boissons-row-2');
        if (boissonsRow1 && boissonsRow2) {
            const midPoint = Math.ceil(this.boissonsData.length / 2);
            this.renderItems(this.boissonsData.slice(0, midPoint), boissonsRow1);
            this.renderItems(this.boissonsData.slice(midPoint), boissonsRow2);
        }
    }

    renderItems(items, container) {
        container.innerHTML = '';
        items.forEach(item => {
            const itemElement = this.createMenuItem(item);
            container.appendChild(itemElement);
        });
    }

    createMenuItem(item) {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div class="menu-item-image-container">
                <img src="assets/images/${item.image}" alt="${item.name}" class="menu-item-image">
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-name">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">${item.price} FCFA</span>
                    ${this.createAddToCartButton(item)}
                </div>
            </div>
        `;
        return div;
    }

    createAddToCartButton(item) {
        const button = document.createElement('button');
        button.className = 'add-to-cart-btn';
        button.setAttribute('aria-label', `Ajouter ${item.name} au panier`);
        button.setAttribute('role', 'button'); // Ajout de l'attribut role pour les lecteurs d'écran
        button.dataset.item = JSON.stringify(item);
        button.innerHTML = '<i class="fas fa-plus"></i> Ajouter';
        return button.outerHTML;
    }

    setupEventListeners() {
        // Gestion du défilement horizontal
        document.querySelectorAll('.menu-grid').forEach(grid => {
            const scrollLeft = grid.parentElement.querySelector('.scroll-left');
            const scrollRight = grid.parentElement.querySelector('.scroll-right');

            if (scrollLeft) {
                scrollLeft.addEventListener('click', () => {
                    grid.scrollBy({ left: -300, behavior: 'smooth' });
                });
            }

            if (scrollRight) {
                scrollRight.addEventListener('click', () => {
                    grid.scrollBy({ left: 300, behavior: 'smooth' });
                });
            }
        });

        // Gestion des boutons "Ajouter au panier"
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const button = e.target.closest('.add-to-cart-btn');
                const itemData = JSON.parse(button.dataset.item);
                cart.add(itemData);
            }
        });

        // Ajout d'attributs ARIA pour les éléments de menu
        const menuItems = document.querySelectorAll('.nav-item');
        menuItems.forEach(item => {
            item.setAttribute('tabindex', '0'); // Rendre les éléments de menu accessibles au clavier
            item.setAttribute('aria-label', item.textContent.trim()); // Fournir une description pour les lecteurs d'écran
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.menu = new Menu();
});