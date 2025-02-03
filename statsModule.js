// Module de statistiques avancées pour Sarafina
import { fetchDailyStats, fetchMonthlyStats } from './apiModule.js';

// Importer Chart.js de manière compatible avec les modules
async function loadChartJS() {
    if (typeof window.Chart === 'undefined') {
        const chartModule = await import('https://cdn.jsdelivr.net/npm/chart.js/dist/chart.js');
        window.Chart = chartModule.Chart;
    }
    return window.Chart;
}

class StatsManager {
    constructor() {
        this.dailyStatsChart = null;
        this.monthlyStatsChart = null;
    }

    // Préparer les données pour le graphique
    _prepareChartData(stats, type = 'daily') {
        let chartData = {
            labels: [],
            datasets: [
                {
                    label: 'Revenu Total',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Nombre de Commandes',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        };

        if (type === 'daily') {
            // Pour les statistiques journalières
            chartData.labels = [new Date().toLocaleDateString()];
            chartData.datasets[0].data = [stats.totalRevenue || 0];
            chartData.datasets[1].data = [stats.totalOrders || 0];
        } else {
            // Pour les statistiques mensuelles
            const breakdown = stats.dailyBreakdown || {};
            const sortedDates = Object.keys(breakdown).sort();
            
            chartData.labels = sortedDates.map(date => 
                new Date(date).toLocaleDateString()
            );
            
            chartData.datasets[0].data = sortedDates.map(date => 
                breakdown[date].revenue || 0
            );
            
            chartData.datasets[1].data = sortedDates.map(date => 
                breakdown[date].orders || 0
            );
        }

        return chartData;
    }

    // Créer un graphique de statistiques
    async _createChart(canvasId, data, title) {
        const Chart = await loadChartJS();
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (this.chart.data.datasets[0].label === 'Revenu Total') {
                                    return value.toLocaleString() + ' FCFA';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Charger et afficher les statistiques journalières
    async loadDailyStats() {
        try {
            const stats = await fetchDailyStats();
            const chartData = this._prepareChartData(stats, 'daily');
            
            if (this.dailyStatsChart) {
                this.dailyStatsChart.destroy();
            }
            
            this.dailyStatsChart = await this._createChart(
                'daily-stats-chart', 
                chartData, 
                'Statistiques Journalières'
            );

            this.generateReport(stats);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques journalières:', error);
            throw error;
        }
    }

    // Charger et afficher les statistiques mensuelles
    async loadMonthlyStats() {
        try {
            const stats = await fetchMonthlyStats();
            const chartData = this._prepareChartData(stats, 'monthly');
            
            if (this.monthlyStatsChart) {
                this.monthlyStatsChart.destroy();
            }
            
            this.monthlyStatsChart = await this._createChart(
                'monthly-stats-chart', 
                chartData, 
                'Statistiques Mensuelles'
            );

            this.generateMonthlyReport(stats);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques mensuelles:', error);
            throw error;
        }
    }

    // Générer un rapport détaillé journalier
    generateReport(stats) {
        const reportContainer = document.getElementById('stats-report');
        if (!reportContainer) return;

        reportContainer.innerHTML = `
            <h3>Rapport Journalier</h3>
            <div class="report-summary">
                <div class="stat-item">
                    <span class="stat-label">Commandes Totales:</span>
                    <span class="stat-value">${stats.totalOrders}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Revenu Total:</span>
                    <span class="stat-value">${stats.totalRevenue.toLocaleString()} FCFA</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Valeur Moyenne/Commande:</span>
                    <span class="stat-value">${stats.averageOrderValue.toLocaleString()} FCFA</span>
                </div>
            </div>
            <div class="status-breakdown">
                <h4>Répartition par Statut</h4>
                <div class="status-grid">
                    <div class="status-item">
                        <span class="status pending">En attente</span>
                        <span class="count">${stats.ordersByStatus.pending}</span>
                    </div>
                    <div class="status-item">
                        <span class="status preparing">En préparation</span>
                        <span class="count">${stats.ordersByStatus.preparing}</span>
                    </div>
                    <div class="status-item">
                        <span class="status ready">Prêt</span>
                        <span class="count">${stats.ordersByStatus.ready}</span>
                    </div>
                    <div class="status-item">
                        <span class="status completed">Terminé</span>
                        <span class="count">${stats.ordersByStatus.completed}</span>
                    </div>
                    <div class="status-item">
                        <span class="status cancelled">Annulé</span>
                        <span class="count">${stats.ordersByStatus.cancelled}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Générer un rapport détaillé mensuel

}

export default new StatsManager();
