// Configuration globale de l'application Sarafina

const DEV_CONFIG = {
    API: {
        BASE_URL: 'http://localhost:3000',  // Mise à jour pour correspondre au port du serveur Node.js
        ENDPOINTS: {
            ORDERS: '/orders',
            USERS: '/users',
            AUTH: '/auth',
            STATS: '/stats'
        },
        REFRESH_INTERVAL: 30000 // 30 secondes
    }
};

const PROD_CONFIG = {
    API: {
        BASE_URL: 'http://localhost:3000',  // Mise à jour pour la production
        ENDPOINTS: {
            ORDERS: '/orders',
            USERS: '/users',
            AUTH: '/auth',
            STATS: '/stats'
        },
        REFRESH_INTERVAL: 30000
    }
};

// Utiliser la configuration de développement par défaut
export const CONFIG = {
    ...DEV_CONFIG,
    
    // Configuration des statuts de commande
    ORDER_STATUS: {
        PENDING: 'pending',
        PREPARING: 'preparing',
        READY: 'ready',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Configuration des rôles utilisateur
    USER_ROLES: {
        ADMIN: 'admin',
        CASHIER: 'cashier',
        CUSTOMER: 'customer'
    },

    // Configuration des méthodes de paiement
    PAYMENT_METHODS: {
        WAVE: {
            name: 'Wave',
            code: 'wave',
            logo: 'assets/images/logo-wave.png',
            number: '77 123 45 67'
        },
        ORANGE_MONEY: {
            name: 'Orange Money',
            code: 'orange-money',
            logo: 'assets/images/logo-orange-money.png',
            number: '77 890 12 34'
        },
        CASH: {
            name: 'Espèces',
            code: 'cash',
            logo: 'assets/images/argent.png',
            number: 'À la caisse'
        }
    },

    // Messages d'erreur
    ERROR_MESSAGES: {
        AUTH_REQUIRED: 'Authentification requise',
        INVALID_CREDENTIALS: 'Identifiants invalides',
        SERVER_ERROR: 'Erreur serveur',
        NETWORK_ERROR: 'Erreur réseau - Vérifiez que le serveur est en cours d\'exécution',
        INVALID_INPUT: 'Données invalides'
    },

    // Timeouts
    TIMEOUTS: {
        SESSION: 3600000, // 1 heure
        API_CALL: 30000,  // 30 secondes
        NOTIFICATION: 5000 // 5 secondes
    }
};
