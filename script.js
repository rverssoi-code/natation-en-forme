// ===========================
// ACTUALITÉS - Chargement dynamique
// ===========================
async function loadActualites() {
    const container = document.querySelector('.actualites-liste .container');
    
    // Vérifier si on est sur la page actualités
    if (!container) return;
    
    try {
        const response = await fetch('/data/actualites.json');
        
        if (!response.ok) {
            throw new Error('Fichier actualités non trouvé');
        }
        
        const data = await response.json();
        const actualites = data.actualites || [];
        
        // Trier par date (plus récent en premier)
        actualites.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Créer le HTML des actualités
        let html = '<h2 class="section-title">Nouvelles récentes</h2>';
        
        if (actualites.length === 0) {
            html += `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <p style="font-size: 1.2rem;">Aucune actualité pour le moment.</p>
                    <p>Revenez bientôt pour nos dernières nouvelles! 🌊</p>
                </div>
            `;
        } else {
            html += '<div class="actualites-grid">';
            
            actualites.forEach(actualite => {
                const dateObj = new Date(actualite.date + 'T00:00:00');
                const dateFormatee = dateObj.toLocaleDateString('fr-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                // Convertir les retours de ligne en <br>
                const contenuHTML = actualite.contenu.replace(/\r?\n/g, '<br>');
                
                html += `
                    <div class="actualite-card">
                        <div class="actualite-header">
                            <h3>${actualite.titre}</h3>
                            <span class="actualite-date">📅 ${dateFormatee}</span>
                        </div>
                        <div class="actualite-content">
                            ${contenuHTML}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        container.innerHTML = html;
        
        // Réappliquer l'animation fade-in aux nouvelles cartes
document.querySelectorAll('.actualite-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    // Utiliser observer seulement s'il existe
    if (typeof observer !== 'undefined') {
        observer.observe(card);
    } else {
        // Animation immédiate si observer n'existe pas
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }
});

    } catch (error) {
        console.error('Erreur chargement actualités:', error);
        container.innerHTML = `
            <h2 class="section-title">Nouvelles récentes</h2>
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <p style="font-size: 1.2rem;">Les actualités sont temporairement indisponibles.</p>
                <p>Veuillez réessayer plus tard. 🌊</p>
            </div>
        `;
    }
}

// Appeler loadActualites au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadActualites();
});