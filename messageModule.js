// Module de gestion des messages pour Sarafina
import { CONFIG } from './config.js';
import { showError } from '../components/uiModule.js';

class DelayedMessageSender {
    constructor(delay = 1000) {
        this.delay = delay;
        this.pendingMessages = new Map();
    }

    async sendMessage(message, type = 'order') {
        const messageId = Date.now().toString();
        
        try {
            // Créer une promesse qui peut être annulée
            const messagePromise = new Promise(async (resolve, reject) => {
                this.pendingMessages.set(messageId, { reject });

                try {
                    // Simuler un délai réseau
                    await new Promise(resolve => setTimeout(resolve, this.delay));

                    // Envoyer le message au serveur
                    const response = await fetch(`${CONFIG.API.BASE_URL}/messages`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            content: message,
                            type: type,
                            timestamp: new Date().toISOString()
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Erreur lors de l\'envoi du message');
                    }

                    const result = await response.json();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.pendingMessages.delete(messageId);
                }
            });

            return await messagePromise;
        } catch (error) {
            if (error.message === 'Cancelled') {
                console.warn('Envoi du message annulé:', message);
            }
            throw error;
        }
    }

    cancelMessage(messageId) {
        const message = this.pendingMessages.get(messageId);
        if (message) {
            message.reject(new Error('Cancelled'));
            this.pendingMessages.delete(messageId);
        }
    }

    cancelAllMessages() {
        for (const [messageId, message] of this.pendingMessages) {
            message.reject(new Error('Cancelled'));
        }
        this.pendingMessages.clear();
    }
}

// Instance unique du gestionnaire de messages
export const messageSender = new DelayedMessageSender();

// Fonction pour envoyer une notification de commande
export async function sendOrderNotification(order) {
    try {
        const message = {
            type: 'order_notification',
            orderId: order.id,
            tableNumber: order.tableNumber,
            items: order.items,
            total: order.total,
            timestamp: new Date().toISOString()
        };

        await messageSender.sendMessage(JSON.stringify(message), 'order');
        console.log('Notification de commande envoyée avec succès');
    } catch (error) {
        if (error.message === 'Cancelled') {
            console.warn('Envoi de la notification annulé:', error);
        } else {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            showError('Erreur lors de l\'envoi de la notification');
        }
    }
}

// Fonction pour envoyer une notification de statut
export async function sendStatusUpdate(orderId, newStatus) {
    try {
        const message = {
            type: 'status_update',
            orderId: orderId,
            status: newStatus,
            timestamp: new Date().toISOString()
        };

        await messageSender.sendMessage(JSON.stringify(message), 'status');
        console.log('Mise à jour du statut envoyée avec succès');
    } catch (error) {
        if (error.message === 'Cancelled') {
            console.warn('Envoi de la mise à jour annulé:', error);
        } else {
            console.error('Erreur lors de l\'envoi de la mise à jour:', error);
            showError('Erreur lors de la mise à jour du statut');
        }
    }
}
