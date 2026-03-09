// ===========================
// 🚨 POP-UP CONFIGURATION 🚨
// ===========================
// POPUP_ACTIVE: Change à 'false' pour désactiver complètement le pop-up
const POPUP_ACTIVE = true;

// POPUP_SHOW_ONCE: Contrôle la fréquence d'affichage
// true  = Le pop-up apparaît seulement à la PREMIÈRE visite (se souvient avec localStorage)
// false = Le pop-up apparaît à CHAQUE visite (comportement actuel)
const POPUP_SHOW_ONCE = true;

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
                body.classList.remove('active');
            }
        });
    }
    
    // Initialiser le pop-up (seulement sur index.html)
    initPopup();
    
    // Initialiser le carrousel d'images
    initImageCarousel();
});

// ===========================
// POP-UP SYSTÈME
// ===========================
function initPopup() {
    // Vérifier si le pop-up est activé
    if (!POPUP_ACTIVE) {
        console.log('Pop-up désactivé (POPUP_ACTIVE = false)');
        return;
    }
    
    // Vérifier si on doit afficher seulement une fois
    if (POPUP_SHOW_ONCE) {
        const hasSeenPopup = localStorage.getItem('natationPopupSeen');
        if (hasSeenPopup === 'true') {
            console.log('Pop-up déjà vu (POPUP_SHOW_ONCE = true)');
            return;
        }
    }
    
    // Vérifier si on est sur la page index
    const isIndexPage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' || 
                       window.location.pathname.endsWith('/index.html');
    
    if (!isIndexPage) {
        console.log('Pop-up non affiché (pas sur index.html)');
        return;
    }
    
    // Créer le HTML du pop-up
    const popupHTML = `
        <div class="popup-overlay" id="relachePopup">
            <div class="popup-container">
                <button class="popup-close" id="popupClose" aria-label="Fermer">×</button>
                <div class="popup-content" id="popupClickable">
                    <div class="popup-icon">⚠️</div>
                    <h3 class="popup-title">ATTENTION</h3>
                    <p class="popup-message">Horaire de cours et d'inscriptions modifié</p>
                    <p class="popup-cta">Cliquez ici pour les actualités</p>
                </div>
            </div>
        </div>
    `;
    
    // Injecter le pop-up dans le body
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Marquer comme vu si POPUP_SHOW_ONCE est activé
    if (POPUP_SHOW_ONCE) {
        localStorage.setItem('natationPopupSeen', 'true');
    }
    
    // Références
    const popup = document.getElementById('relachePopup');
    const closeBtn = document.getElementById('popupClose');
    const clickableArea = document.getElementById('popupClickable');
    
    // Afficher le pop-up après un court délai (pour l'animation)
    setTimeout(() => {
        popup.classList.add('active');
    }, 500);
    
    // Fermer au clic sur X
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
        }, 300);
    });
    
    // Rediriger vers actualités au clic sur le contenu
    clickableArea.addEventListener('click', () => {
        window.location.href = '/pages/actualites.html';
    });
    
    console.log('Pop-up affiché!');
}

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
    
    // Changer d'image toutes les 2.5 secondes
    setInterval(changeImage, 2500);
}