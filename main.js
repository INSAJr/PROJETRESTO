// Fonction pour formater les prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Système de notifications toast
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Chargement du menu
async function loadMenu() {
    try {
        const response = await fetch('../backend/api/menu/get_menu.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erreur lors du chargement du menu');
        }
        
        // Organiser les items par catégorie
        const categories = data.data.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
        
        // Générer le HTML
        let html = '';
        for (const [category, items] of Object.entries(categories)) {
            html += `
                <section class="category">
                    <h2>${category}</h2>
                    <div class="items">
            `;
            
            // Diviser les items en deux rangées équilibrées
            const midPoint = Math.ceil(items.length / 2);
            const firstRow = items.slice(0, midPoint);
            const secondRow = items.slice(midPoint);
            
            // Première rangée
            html += '<div class="items-row">';
            for (const item of firstRow) {
                html += generateMenuItem(item);
            }
            html += '</div>';
            
            // Deuxième rangée
            html += '<div class="items-row">';
            for (const item of secondRow) {
                html += generateMenuItem(item);
            }
            html += '</div>';
            
            html += '</div></section>';
        }
        
        document.getElementById('menu').innerHTML = html;
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('menu').innerHTML = `
            <div class="error">
                Une erreur est survenue lors du chargement du menu.
                Veuillez réessayer plus tard.
            </div>
        `;
    }
}

// Fonction pour générer le HTML d'un item du menu
function generateMenuItem(item) {
    return `
        <div class="menu-item">
            <div class="menu-item-frame">
                <img src="${item.image}" alt="${item.name}" 
                     onerror="this.src='assets/images/default.jpg'" loading="lazy">
            </div>
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <p class="price">${formatPrice(item.price)}</p>
                <button class="add-to-cart" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">
                    <i class="fas fa-plus"></i> Ajouter
                </button>
            </div>
        </div>`;
}

// Gestion du thème
function initTheme() {
   
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    if (window.cartManager) {
        window.cartManager.updateCartDisplay();
    }
});