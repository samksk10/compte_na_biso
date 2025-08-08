// Affiche le graphique USD → EU
async function afficherGraphiqueUsdEur() {
    const ctx = document.getElementById('usdEurChart').getContext('2d');
    const response = await fetch('api/tauxChange.php?devise_source=USD&devise_cible=EUR');
    const data = await response.json();

    const labels = data.map(taux => taux.date_effective);
    const values = data.map(taux => Number(taux.TauxChange));

    if (window.usdEurChart && typeof window.usdEurChart.destroy === 'function') {
        window.usdEurChart.destroy();
    }
    window.usdEurChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [ {
                label: 'USD → EUR',
                data: values,
                borderColor: 'rgba(25,135,84,1)',
                backgroundColor: 'rgba(25,135,84,0.1)',
                fill: true,
                tension: 0.2
            } ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Taux' } }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', afficherGraphiqueUsdEur);