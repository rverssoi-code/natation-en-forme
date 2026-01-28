// ===========================
// MENU HAMBURGER - Navigation mobile
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Vérifier que les éléments existent
    if (menuToggle && navMenu) {
        // Toggle menu au clic
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle la classe active
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            console.log('Menu toggled!'); // Debug
        });
        
        // Fermer le menu si on clique sur un lien
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Fermer le menu si on clique en dehors
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }
    
    // Charger les actualités
    loadActualites();
    
    // Initialiser le carrousel d'images
    initImageCarousel();
});

// ===========================
// CARROUSEL D'IMAGES
// ===========================
function initImageCarousel() {
    const carousel = document.querySelector('.image-carousel');
    
    // Vérifier si le carrousel existe sur cette page
    if (!carousel) return;
    
    const images = carousel.querySelectorAll('.carousel-image');
    
    if (images.length === 0) return;
    
    let currentIndex = 0;
    
    // Fonction pour changer d'image
    function changeImage() {
        // Retirer la classe active de l'image actuelle
        images[currentIndex].classList.remove('active');
        
        // Passer à l'image suivante (revenir au début si on est à la fin)
        currentIndex = (currentIndex + 1) % images.length;
        
        // Ajouter la classe active à la nouvelle image
        images[currentIndex].classList.add('active');
    }
    
    // Changer d'image toutes les 1.5 secondes (1500ms)
    setInterval(changeImage, 2500);
}

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