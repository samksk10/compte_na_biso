// Affiche le graphique USD → CDF
async function afficherGraphiqueUsdCdf() {
    const ctx = document.getElementById('usdCdfChart').getContext('2d');
    const response = await fetch('api/tauxChange.php?devise_source=USD&devise_cible=CDF');
    const data = await response.json();

    const labels = data.map(taux => taux.date_effective);
    const values = data.map(taux => Number(taux.TauxChange));

    if (window.usdCdfChart && typeof window.usdCdfChart.destroy === 'function') {
        window.usdCdfChart.destroy();
    }
    window.usdCdfChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [ {
                label: 'USD → CDF',
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
document.addEventListener('DOMContentLoaded', afficherGraphiqueUsdCdf);