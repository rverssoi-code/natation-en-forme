// ===========================
// 🚨 POP-UP CONFIGURATION 🚨
// ===========================
// POPUP_ACTIVE: Change à 'false' pour désactiver complètement le pop-up
const POPUP_ACTIVE = true;

// POPUP_SHOW_ONCE: Contrôle la fréquence d'affichage
// true  = Le pop-up apparaît seulement à la PREMIÈRE visite (se souvient avec localStorage)
// false = Le pop-up apparaît à CHAQUE visite
const POPUP_SHOW_ONCE = true;

// ===========================
// MENU HAMBURGER - Navigation mobile
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
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

    initPopup();
    initImageCarousel();
});

// ===========================
// POP-UP SYSTÈME
// ===========================
function initPopup() {
    if (!POPUP_ACTIVE) return;

    if (POPUP_SHOW_ONCE) {
        const hasSeenPopup = localStorage.getItem('natationPopupSeen');
        if (hasSeenPopup === 'true') return;
    }

    // Afficher seulement sur la page index
    const isIndexPage = window.location.pathname === '/' ||
                       window.location.pathname === '/index.html' ||
                       window.location.pathname.endsWith('/index.html');

    if (!isIndexPage) return;

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

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    if (POPUP_SHOW_ONCE) {
        localStorage.setItem('natationPopupSeen', 'true');
    }

    const popup = document.getElementById('relachePopup');
    const closeBtn = document.getElementById('popupClose');
    const clickableArea = document.getElementById('popupClickable');

    setTimeout(() => {
        popup.classList.add('active');
    }, 500);

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.remove('active');
        setTimeout(() => { popup.remove(); }, 300);
    });

    clickableArea.addEventListener('click', () => {
        window.location.href = '/pages/actualites.html';
    });
}

// ===========================
// CARROUSEL D'IMAGES
// ===========================
function initImageCarousel() {
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('.carousel-image');
    if (images.length === 0) return;

    let currentIndex = 0;

    function changeImage() {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }

    setInterval(changeImage, 2500);
}
