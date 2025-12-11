// ========================================
// ADMIN ACTUALITÉS RVS HEALTH
// Gestion complète avec GitHub Gists + Commits
// ========================================

// ⚙️ CONFIGURATION GITHUB
const GITHUB_CONFIG = {
    username: 'rverssoi-code',
    repo: 'rvs-health-website',
    branch: 'main',
    token: null, // Sera chargé depuis localStorage
};

// Fonction pour obtenir le token
function getGitHubToken() {
    let token = localStorage.getItem('rvs_github_token');
    
    if (!token) {
        // Demander le token à l'utilisateur
        token = prompt(
            '🔑 Configuration GitHub\n\n' +
            'Pour utiliser l\'admin, entrez votre token GitHub Personnel.\n\n' +
            'Vous ne le verrez qu\'une seule fois.\n' +
            'Il sera sauvegardé de façon sécurisée dans votre navigateur.\n\n' +
            'Token GitHub :'
        );
        
        if (!token || token.trim() === '') {
            alert('❌ Token requis pour utiliser l\'admin.\n\nVous allez être déconnecté.');
            sessionStorage.removeItem('rvs_admin_auth');
            window.location.href = 'index.html';
            return null;
        }
        
        // Valider le format du token
        if (!token.startsWith('ghp_')) {
            alert('⚠️ Le token doit commencer par "ghp_"\n\nVérifiez votre token GitHub.');
            return getGitHubToken(); // Redemander
        }
        
        // Sauvegarder
        localStorage.setItem('rvs_github_token', token.trim());
        alert('✅ Token sauvegardé !\n\nVous êtes prêt à utiliser l\'admin.');
    }
    
    GITHUB_CONFIG.token = token;
    return token;
}

// État de l'application
let actualites = [];
let currentEditId = null;
let filterMode = 'all'; // 'all', 'published', 'drafts'

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    console.log('🌿 RVS Health Admin - Initialisation...');
    
    // Obtenir/demander le token GitHub
    const token = getGitHubToken();
    if (!token) return; // Si pas de token, déjà redirigé
    
    // Charger les actualités
    await loadActualites();
    
    // Set date du jour par défaut
    document.getElementById('date').valueAsDate = new Date();
    
    // Event listeners
    setupEventListeners();
    
    console.log('✅ Admin prêt !');
}

function setupEventListeners() {
    // Formulaire
    document.getElementById('actualiteForm').addEventListener('submit', handlePublish);
    document.getElementById('saveDraftBtn').addEventListener('click', handleSaveDraft);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
    
    // Filtres
    document.getElementById('showAllBtn').addEventListener('click', () => filterActualites('all'));
    document.getElementById('showPublishedBtn').addEventListener('click', () => filterActualites('published'));
    document.getElementById('showDraftsBtn').addEventListener('click', () => filterActualites('drafts'));
}

// ========================================
// CHARGEMENT DES ACTUALITÉS
// ========================================

async function loadActualites() {
    try {
        showStatus('Chargement des actualités...', 'draft');
        
        // Charger depuis le fichier actualites.json sur GitHub
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/data/actualites.json`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content); // Décoder base64
            const jsonData = JSON.parse(content);
            actualites = jsonData.actualites || [];
        } else {
            // Fichier n'existe pas encore, c'est OK
            actualites = [];
        }
        
        // Charger aussi les brouillons depuis Gists
        await loadDraftsFromGists();
        
        renderActualites();
        hideStatus();
        
    } catch (error) {
        console.error('Erreur chargement:', error);
        showStatus('Erreur de chargement', 'error');
    }
}

async function loadDraftsFromGists() {
    try {
        // Récupérer les Gists de l'utilisateur
        const response = await fetch('https://api.github.com/gists', {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const gists = await response.json();
            
            // Filtrer les Gists RVS Health
            const rvsGists = gists.filter(g => 
                g.description && g.description.startsWith('[RVS-DRAFT]')
            );
            
            // Ajouter les brouillons
            for (const gist of rvsGists) {
                const file = Object.values(gist.files)[0];
                const draft = JSON.parse(file.content);
                draft.gistId = gist.id; // Sauvegarder l'ID du Gist
                
                // Vérifier si pas déjà dans les actualités publiées
                if (!actualites.find(a => a.id === draft.id)) {
                    actualites.push(draft);
                }
            }
        }
    } catch (error) {
        console.error('Erreur chargement brouillons:', error);
    }
}

// ========================================
// AFFICHAGE DES ACTUALITÉS
// ========================================

function renderActualites() {
    const container = document.getElementById('actualitesList');
    
    // Filtrer selon le mode
    let filtered = actualites;
    if (filterMode === 'published') {
        filtered = actualites.filter(a => a.published);
    } else if (filterMode === 'drafts') {
        filtered = actualites.filter(a => !a.published);
    }
    
    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: var(--gris-doux); padding: 40px;">
                Aucune actualité trouvée.<br>
                ${filterMode !== 'all' ? 'Changez de filtre ou créez-en une ! 🌱' : 'Commencez par en créer une ! 🌱'}
            </p>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(actualite => `
        <div class="actualite-item ${currentEditId === actualite.id ? 'active' : ''}" 
             onclick="editActualite('${actualite.id}')">
            <h3>${actualite.titre}</h3>
            <div class="actualite-meta">
                <span>📅 ${formatDate(actualite.date)}</span>
                <span>${actualite.published ? '✅ Publié' : '📝 Brouillon'}</span>
            </div>
            <p class="actualite-excerpt">${truncate(actualite.contenu, 100)}</p>
            <div class="actualite-actions" onclick="event.stopPropagation()">
                ${!actualite.published ? `
                    <button class="btn btn-small btn-primary" onclick="publishDraft('${actualite.id}')">
                        🚀 Publier
                    </button>
                ` : ''}
                <button class="btn btn-small btn-delete" onclick="deleteActualite('${actualite.id}')">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function filterActualites(mode) {
    filterMode = mode;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.actualites-list .btn-small').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    
    if (mode === 'all') document.getElementById('showAllBtn').classList.add('btn-primary');
    if (mode === 'published') document.getElementById('showPublishedBtn').classList.add('btn-primary');
    if (mode === 'drafts') document.getElementById('showDraftsBtn').classList.add('btn-primary');
    
    renderActualites();
}

// ========================================
// ÉDITION
// ========================================

function editActualite(id) {
    const actualite = actualites.find(a => a.id === id);
    if (!actualite) return;
    
    currentEditId = id;
    
    document.getElementById('editorTitle').textContent = '✏️ Modifier l\'actualité';
    document.getElementById('actualiteId').value = id;
    document.getElementById('titre').value = actualite.titre;
    document.getElementById('date').value = actualite.date;
    document.getElementById('contenu').value = actualite.contenu;
    
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    renderActualites();
    
    // Scroll vers le formulaire
    document.querySelector('.editor-panel').scrollIntoView({ behavior: 'smooth' });
}

function handleCancel() {
    currentEditId = null;
    document.getElementById('editorTitle').textContent = '✏️ Nouvelle actualité';
    document.getElementById('actualiteForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('cancelBtn').style.display = 'none';
    renderActualites();
}

// ========================================
// SAUVEGARDE BROUILLON (GIST)
// ========================================

async function handleSaveDraft() {
    const actualite = getFormData();
    actualite.published = false;
    
    try {
        showStatus('💾 Sauvegarde du brouillon...', 'draft');
        
        // Sauvegarder dans GitHub Gist
        const gistData = {
            description: `[RVS-DRAFT] ${actualite.titre}`,
            public: false,
            files: {
                [`rvs-draft-${actualite.id}.json`]: {
                    content: JSON.stringify(actualite, null, 2)
                }
            }
        };
        
        let response;
        const existingActualite = actualites.find(a => a.id === actualite.id);
        
        if (existingActualite && existingActualite.gistId) {
            // Mettre à jour Gist existant
            response = await fetch(`https://api.github.com/gists/${existingActualite.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
        } else {
            // Créer nouveau Gist
            response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
        }
        
        if (response.ok) {
            const gist = await response.json();
            actualite.gistId = gist.id;
            
            // Mettre à jour la liste locale
            const index = actualites.findIndex(a => a.id === actualite.id);
            if (index >= 0) {
                actualites[index] = actualite;
            } else {
                actualites.push(actualite);
            }
            
            renderActualites();
            showStatus('✅ Brouillon sauvegardé !', 'saved');
            
            setTimeout(hideStatus, 2000);
        } else {
            throw new Error('Erreur sauvegarde Gist');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('❌ Erreur de sauvegarde', 'error');
    }
}

// ========================================
// PUBLICATION (COMMIT SUR GITHUB)
// ========================================

async function handlePublish(e) {
    e.preventDefault();
    
    const actualite = getFormData();
    actualite.published = true;
    
    if (!confirm('Publier cette actualité sur le site ?')) return;
    
    try {
        showStatus('🚀 Publication en cours...', 'draft');
        
        // Mettre à jour la liste
        const index = actualites.findIndex(a => a.id === actualite.id);
        if (index >= 0) {
            actualites[index] = actualite;
        } else {
            actualites.push(actualite);
        }
        
        // Filtrer seulement les actualités publiées pour le fichier JSON
        const publishedActualites = actualites.filter(a => a.published);
        
        // Créer le contenu JSON
        const jsonContent = JSON.stringify({
            actualites: publishedActualites
        }, null, 2);
        
        // Commit sur GitHub
        await commitToGitHub(jsonContent, actualite);
        
        // Supprimer le Gist brouillon si existe
        if (actualite.gistId) {
            await deleteGist(actualite.gistId);
            delete actualite.gistId;
        }
        
        renderActualites();
        handleCancel();
        
        showStatus('✅ Publié avec succès !', 'saved');
        setTimeout(hideStatus, 3000);
        
    } catch (error) {
        console.error('Erreur publication:', error);
        showStatus('❌ Erreur de publication', 'error');
    }
}

async function publishDraft(id) {
    const actualite = actualites.find(a => a.id === id);
    if (!actualite) return;
    
    actualite.published = true;
    
    // Remplir le formulaire et publier
    editActualite(id);
    
    // Simuler le submit
    setTimeout(() => {
        document.getElementById('actualiteForm').requestSubmit();
    }, 100);
}

// ========================================
// COMMIT GITHUB
// ========================================

async function commitToGitHub(content, actualite) {
    const filePath = 'data/actualites.json';
    
    // 1. Récupérer le SHA du fichier existant (si existe)
    let sha = null;
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
    } catch (error) {
        // Fichier n'existe pas encore, c'est OK
    }
    
    // 2. Créer/Mettre à jour le fichier
    const commitData = {
        message: `📝 Actualité: ${actualite.titre}`,
        content: btoa(unescape(encodeURIComponent(content))), // Encoder en base64
        branch: GITHUB_CONFIG.branch
    };
    
    if (sha) {
        commitData.sha = sha; // Nécessaire pour update
    }
    
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitData)
        }
    );
    
    if (!response.ok) {
        throw new Error('Erreur commit GitHub');
    }
    
    return await response.json();
}

// ========================================
// SUPPRESSION
// ========================================

async function deleteActualite(id) {
    if (!confirm('Supprimer cette actualité ?')) return;
    
    try {
        const actualite = actualites.find(a => a.id === id);
        
        // Supprimer le Gist si c'est un brouillon
        if (actualite.gistId) {
            await deleteGist(actualite.gistId);
        }
        
        // Retirer de la liste
        actualites = actualites.filter(a => a.id !== id);
        
        // Si c'était publié, mettre à jour le fichier JSON
        if (actualite.published) {
            const publishedActualites = actualites.filter(a => a.published);
            const jsonContent = JSON.stringify({
                actualites: publishedActualites
            }, null, 2);
            
            await commitToGitHub(jsonContent, { titre: 'Suppression actualité' });
        }
        
        if (currentEditId === id) {
            handleCancel();
        }
        
        renderActualites();
        showStatus('✅ Actualité supprimée', 'saved');
        setTimeout(hideStatus, 2000);
        
    } catch (error) {
        console.error('Erreur suppression:', error);
        showStatus('❌ Erreur de suppression', 'error');
    }
}

async function deleteGist(gistId) {
    await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`
        }
    });
}

// ========================================
// UTILITAIRES
// ========================================

function getFormData() {
    const id = document.getElementById('actualiteId').value || generateId();
    
    return {
        id: id,
        titre: document.getElementById('titre').value,
        date: document.getElementById('date').value,
        contenu: document.getElementById('contenu').value,
        published: false
    };
}

function generateId() {
    const date = document.getElementById('date').value;
    const titre = document.getElementById('titre').value;
    const slug = titre.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    
    return `${date}-${slug}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = 'status-indicator';
    
    if (type === 'saved') statusDiv.classList.add('status-saved');
    if (type === 'draft') statusDiv.classList.add('status-draft');
    
    statusDiv.style.display = 'inline-block';
}

function hideStatus() {
    document.getElementById('statusMessage').style.display = 'none';
}
