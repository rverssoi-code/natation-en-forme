// ===========================
// COOKIE BANNER - Natation en Forme
// Conforme à la Loi 25 (Québec)
// ===========================

class CookieBanner {
    constructor() {
        this.cookieName = 'natation-cookie-consent';
        this.cookieDuration = 365; // jours
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur a déjà fait un choix
        const consent = this.getCookie(this.cookieName);
        
        if (!consent) {
            // Afficher le banner après 1 seconde
            setTimeout(() => {
                this.showBanner();
            }, 1000);
        } else {
            // Appliquer les préférences sauvegardées
            this.applyConsent(JSON.parse(consent));
        }

        // Écouter les événements
        this.attachEvents();
    }

    showBanner() {
        const banner = document.querySelector('.cookie-banner');
        if (banner) {
            banner.classList.add('show');
        }
    }

    hideBanner() {
        const banner = document.querySelector('.cookie-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    showSettings() {
        const settings = document.querySelector('.cookie-settings');
        const overlay = document.querySelector('.cookie-settings-overlay');
        
        if (settings && overlay) {
            settings.classList.add('show');
            overlay.classList.add('show');
        }
    }

    hideSettings() {
        const settings = document.querySelector('.cookie-settings');
        const overlay = document.querySelector('.cookie-settings-overlay');
        
        if (settings && overlay) {
            settings.classList.remove('show');
            overlay.classList.remove('show');
        }
    }

    attachEvents() {
        // Bouton Accepter
        const acceptBtn = document.querySelector('.cookie-btn-accept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptAll());
        }

        // Bouton Refuser
        const refuseBtn = document.querySelector('.cookie-btn-refuse');
        if (refuseBtn) {
            refuseBtn.addEventListener('click', () => this.refuseAll());
        }

        // Bouton Gérer
        const manageBtn = document.querySelector('.cookie-btn-manage');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                this.hideBanner();
                this.showSettings();
            });
        }

        // Bouton Sauvegarder (dans le panneau)
        const saveBtn = document.querySelector('.cookie-settings-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePreferences());
        }

        // Bouton Annuler (dans le panneau)
        const cancelBtn = document.querySelector('.cookie-settings-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideSettings();
                this.showBanner();
            });
        }

        // Cliquer sur l'overlay pour fermer
        const overlay = document.querySelector('.cookie-settings-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.hideSettings();
                this.showBanner();
            });
        }
    }

    acceptAll() {
        const consent = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }

    refuseAll() {
        const consent = {
            essential: true, // Toujours true (nécessaires au fonctionnement)
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }

    savePreferences() {
        const analyticsToggle = document.querySelector('#cookie-analytics');
        const marketingToggle = document.querySelector('#cookie-marketing');
        
        const consent = {
            essential: true, // Toujours activé
            analytics: analyticsToggle ? analyticsToggle.checked : false,
            marketing: marketingToggle ? marketingToggle.checked : false,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideSettings();
    }

    saveConsent(consent) {
        const consentString = JSON.stringify(consent);
        this.setCookie(this.cookieName, consentString, this.cookieDuration);
    }

    applyConsent(consent) {
        // Ici tu peux ajouter du code pour activer/désactiver
        // Google Analytics, Facebook Pixel, etc. selon les préférences
        
        console.log('Préférences cookies appliquées:', consent);
        
        // Exemple pour Google Analytics (si tu l'ajoutes plus tard):
        // if (consent.analytics) {
        //     // Activer Google Analytics
        // } else {
        //     // Désactiver Google Analytics
        // }
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        
        return null;
    }
}

// Initialiser le cookie banner au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new CookieBanner();
});
