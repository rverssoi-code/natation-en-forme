// ===========================
// NAVIGATION MOBILE
// ===========================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animation du burger menu
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(45deg) translate(5px, 5px)' 
            : 'none';
        spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(-45deg) translate(7px, -6px)' 
            : 'none';
    });
}

// Fermer le menu au clic sur un lien
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===========================
// SMOOTH SCROLL
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// VIDÉO HERO - Pause si pas visible
// ===========================
const heroVideo = document.getElementById('heroVideo');

if (heroVideo) {
    // Observer pour optimiser la performance
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play();
            } else {
                heroVideo.pause();
            }
        });
    }, { threshold: 0.5 });

    videoObserver.observe(heroVideo);

    // Fallback si vidéo ne charge pas
    heroVideo.addEventListener('error', () => {
        console.log('Vidéo hero non disponible - affichage du fallback');
        const heroSection = document.querySelector('.hero');
        heroSection.style.background = 'linear-gradient(135deg, rgba(0,119,190,0.9) 0%, rgba(0,168,232,0.8) 100%)';
    });
}

// ===========================
// ANIMATION AU SCROLL (Fade In)
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Appliquer l'animation aux cards
document.querySelectorAll('.programme-card, .actualite-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});



// ===========================
// CHARGEMENT DYNAMIQUE ACTUALITÉS
// (Sera connecté à Decap CMS plus tard)
// ===========================
async function chargerActualites() {
    try {
        // Pour l'instant, affichage des actualités statiques
        // Plus tard: fetch des fichiers markdown du dossier /posts
        console.log('Actualités chargées');
    } catch (error) {
        console.error('Erreur chargement actualités:', error);
    }
}

// ===========================
// PERFORMANCE - Lazy Loading Images
// ===========================
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback pour navigateurs anciens
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===========================
// SLIDSHOW DANS INDEX
// ===========================

const images = [

    'images/piscine-rawdon-g.jpg',
    'images/campusstjoseph_lavaltrie.jpg'

];

let index = 0;
const slideshow = document.querySelector('.slideshow');

setInterval(() => {
    slideshow.style.opacity = 0;
    setTimeout(() => {
        index = (index + 1) % images.length;
        slideshow.src = images[index];
        slideshow.style.opacity = 1;
    }, 800);
}, 4000);


// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    chargerActualites();
    console.log('Natation en Forme - Site chargé avec succès! 🏊‍♀️');
});




