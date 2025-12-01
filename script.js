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
// ===========================

// Parser le front matter d'un fichier markdown
function parseFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
        return { metadata: {}, body: content };
    }
    
    const frontMatter = match[1];
    const body = match[2];
    
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Enlever les guillemets
            value = value.replace(/^["']|["']$/g, '');
            
            metadata[key] = value;
        }
    });
    
    return { metadata, body };
}

// Convertir Markdown simple en HTML
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Titres
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');
    
    // Gras
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italique
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Liens
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Listes à puces
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphes
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<')) {
            return `<p>${para.trim()}</p>`;
        }
        return para;
    }).join('\n');
    
    return html;
}

// Formater la date en français
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-CA', options);
}

// Charger toutes les actualités
async function chargerActualites() {
    try {
        // Liste des fichiers markdown (à mettre à jour manuellement ou via un endpoint)
        const fichiers = [
            '2025-08-30-aquaforme-automne.md',
            '2025-08-29-inscriptions-enfants.md',
            '2025-08-27-rabais-rawdon.md',
            '2025-08-27-bains-libres-rawdon.md',
            '2025-08-26-bains-rehabilitation-joliette.md'
        ];
        
        const actualites = [];
        
        // Charger chaque fichier
        for (const fichier of fichiers) {
            try {
                const response = await fetch(`/post/${fichier}`);
                if (!response.ok) continue;
                
                const content = await response.text();
                const { metadata, body } = parseFrontMatter(content);
                
                // Ne charger que les actualités publiées
                if (metadata.published === 'true') {
                    actualites.push({
                        titre: metadata.title,
                        date: metadata.date,
                        image: metadata.image,
                        excerpt: metadata.excerpt,
                        contenu: markdownToHtml(body),
                        fichier: fichier
                    });
                }
            } catch (err) {
                console.warn(`Impossible de charger ${fichier}:`, err);
            }
        }
        
        // TRIER PAR DATE DESCENDANTE (plus récent en premier!)
        actualites.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Afficher les actualités
        afficherActualites(actualites);
        
    } catch (error) {
        console.error('Erreur chargement actualités:', error);
    }
}

// Afficher les actualités dans le HTML
function afficherActualites(actualites) {
    // Pour la page d'accueil (3 dernières actualités)
    const containerAccueil = document.querySelector('#actualites-recentes');
    if (containerAccueil) {
        const dernieresActualites = actualites.slice(0, 3);
        containerAccueil.innerHTML = dernieresActualites.map(actu => `
            <article class="actualite-card">
                ${actu.image ? `<img src="${actu.image}" alt="${actu.titre}">` : ''}
                <div class="actualite-card-content">
                    <span class="actualite-date">${formatDate(actu.date)}</span>
                    <h3>${actu.titre}</h3>
                    <p>${actu.excerpt || ''}</p>
                </div>
            </article>
        `).join('');
        
        // Appliquer l'animation
        document.querySelectorAll('.actualite-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    // Pour la page actualités complète
    const containerPage = document.querySelector('.actualites-liste .container');
    if (containerPage) {
        const titreSection = containerPage.querySelector('.section-title');
        containerPage.innerHTML = '';
        
        // Remettre le titre
        if (titreSection) {
            containerPage.appendChild(titreSection);
        } else {
            containerPage.innerHTML = '<h2 class="section-title">Nouvelles récentes</h2>';
        }
        
        // Ajouter toutes les actualités
        actualites.forEach(actu => {
            const article = document.createElement('article');
            article.className = 'actualite-item';
            article.innerHTML = `
                <div class="actualite-meta">
                    <span class="actualite-date">${formatDate(actu.date)}</span>
                </div>
                <div class="actualite-content">
                    <h3>${actu.titre}</h3>
                    ${actu.excerpt ? `<p>${actu.excerpt}</p>` : ''}
                    <div class="actualite-body">
                        ${actu.contenu}
                    </div>
                </div>
            `;
            containerPage.appendChild(article);
        });
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
// SLIDESHOW DANS INDEX
// ===========================
const slideshowImages = [
    'images/piscine-rawdon-g.jpg',
    'images/campusstjoseph_lavaltrie.jpg'
];

let slideshowIndex = 0;
const slideshow = document.querySelector('.slideshow');

if (slideshow) {
    setInterval(() => {
        slideshow.style.opacity = 0;
        setTimeout(() => {
            slideshowIndex = (slideshowIndex + 1) % slideshowImages.length;
            slideshow.src = slideshowImages[slideshowIndex];
            slideshow.style.opacity = 1;
        }, 800);
    }, 4000);
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    chargerActualites();
    console.log('Natation en Forme - Site chargé avec succès! 🏊‍♀️');
});