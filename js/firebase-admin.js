// ============================================
// FIREBASE ADMIN - COMPLETO CON DONACIONES Y CONTACTO
// Archivo: js/firebase-admin.js
// ============================================

import { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, getDoc, setDoc } from './firebase-config.js';

// Objeto global con todo el contenido
window.contentData = {
    stats: { experience: 30, projects: 15, communities: 50, area: 1000 },
    about: { title: '¿Quiénes somos?', content: '' },
    projects: [],
    team: [],
    gallery: [],
    news: [],
    donations: { title: '', description: '', accounts: [] },
    contact: { address: '', email: '', website: '', phone: '' }
};

// Detectar si usuario está logueado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email;
        await loadAllContent();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorDiv.style.display = 'none';
    } catch (error) {
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    }
});

// Logout
window.logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        showToast('Error al cerrar sesión: ' + error.message, 'error');
    }
};

// Cargar todo el contenido desde Firebase
async function loadAllContent() {
    showLoading(true);
    try {
        // Cargar estadísticas
        const statsDoc = await getDoc(doc(db, 'content', 'stats'));
        if (statsDoc.exists()) {
            window.contentData.stats = statsDoc.data();
            document.getElementById('stat_experience').value = window.contentData.stats.experience || 30;
            document.getElementById('stat_projects').value = window.contentData.stats.projects || 15;
            document.getElementById('stat_communities').value = window.contentData.stats.communities || 50;
            document.getElementById('stat_area').value = window.contentData.stats.area || 1000;
        }
        
        // Cargar Acerca de
        const aboutDoc = await getDoc(doc(db, 'content', 'about'));
        if (aboutDoc.exists()) {
            window.contentData.about = aboutDoc.data();
            document.getElementById('about_title').value = window.contentData.about.title || '';
            document.getElementById('about_content').value = window.contentData.about.content || '';
        }
        
        // Cargar proyectos
        const projectsDoc = await getDoc(doc(db, 'content', 'projects'));
        if (projectsDoc.exists()) {
            window.contentData.projects = projectsDoc.data().items || [];
        }
        renderProjects();
        
        // Cargar equipo
        const teamDoc = await getDoc(doc(db, 'content', 'team'));
        if (teamDoc.exists()) {
            window.contentData.team = teamDoc.data().items || [];
        }
        renderTeam();
        
        // Cargar galería
        const galleryDoc = await getDoc(doc(db, 'content', 'gallery'));
        if (galleryDoc.exists()) {
            window.contentData.gallery = galleryDoc.data().items || [];
        }
        renderGallery();
        
        // Cargar noticias
        const newsDoc = await getDoc(doc(db, 'content', 'news'));
        if (newsDoc.exists()) {
            window.contentData.news = newsDoc.data().items || [];
        }
        renderNews();
        
        // Cargar donaciones
        const donationsDoc = await getDoc(doc(db, 'content', 'donations'));
        if (donationsDoc.exists()) {
            window.contentData.donations = donationsDoc.data();
        }
        renderDonations();
        
        // Cargar contacto
        const contactDoc = await getDoc(doc(db, 'content', 'contact'));
        if (contactDoc.exists()) {
            window.contentData.contact = contactDoc.data();
        }
        renderContact();
        
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('Error al cargar contenido: ' + error.message, 'error');
    }
    showLoading(false);
}

// ============================================
// ESTADÍSTICAS
// ============================================
window.saveStats = async () => {
    showLoading(true);
    try {
        const stats = {
            experience: parseInt(document.getElementById('stat_experience').value),
            projects: parseInt(document.getElementById('stat_projects').value),
            communities: parseInt(document.getElementById('stat_communities').value),
            area: parseInt(document.getElementById('stat_area').value)
        };
        
        await setDoc(doc(db, 'content', 'stats'), stats);
        window.contentData.stats = stats;
        showToast('Estadísticas guardadas exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// ACERCA DE
// ============================================
window.saveAbout = async () => {
    showLoading(true);
    try {
        const about = {
            title: document.getElementById('about_title').value,
            content: document.getElementById('about_content').value
        };
        
        await setDoc(doc(db, 'content', 'about'), about);
        window.contentData.about = about;
        showToast('Información guardada exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// PROYECTOS
// ============================================
function renderProjects() {
    const container = document.getElementById('projectsList');
    container.innerHTML = window.contentData.projects.map((proj, i) => `
        <div class="item-card">
            <button class="delete-btn" onclick="window.deleteProject(${i})">
                <i class="fas fa-trash"></i>
            </button>
            <h5 class="mb-3"><i class="fas fa-folder me-2"></i>${escapeHtml(proj.title || 'Proyecto ' + (i + 1))}</h5>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-control" value="${escapeHtml(proj.title || '')}" onchange="window.updateProject(${i}, 'title', this.value)">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Ubicación</label>
                    <input type="text" class="form-control" value="${escapeHtml(proj.location || '')}" onchange="window.updateProject(${i}, 'location', this.value)">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Imagen/Video (ruta en carpeta img/)</label>
                    <input type="text" class="form-control" value="${escapeHtml(proj.media || '')}" onchange="window.updateProject(${i}, 'media', this.value)" placeholder="img/proyecto.jpg">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Tipo de medio</label>
                    <div class="media-type-selector">
                        <div class="media-type-option ${proj.mediaType === 'image' ? 'active' : ''}" onclick="window.updateProject(${i}, 'mediaType', 'image')">
                            <i class="fas fa-image"></i>
                            <span>Imagen</span>
                        </div>
                        <div class="media-type-option ${proj.mediaType === 'video' ? 'active' : ''}" onclick="window.updateProject(${i}, 'mediaType', 'video')">
                            <i class="fas fa-video"></i>
                            <span>Video</span>
                        </div>
                    </div>
                </div>
                ${proj.media && proj.media !== 'img/' ? `
                <div class="col-12 mb-3">
                    <label class="form-label">Vista previa</label>
                    <div class="preview-container">
                        ${proj.mediaType === 'video' ? 
                            `<video src="${proj.media}" style="max-width: 100%; max-height: 200px;" controls></video>` :
                            `<img src="${proj.media}" alt="${escapeHtml(proj.title || '')}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`
                        }
                    </div>
                </div>
                ` : ''}
                <div class="col-12 mb-3">
                    <label class="form-label">Descripción Corta</label>
                    <textarea class="form-control" rows="2" onchange="window.updateProject(${i}, 'shortDescription', this.value)">${escapeHtml(proj.shortDescription || '')}</textarea>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Descripción Completa</label>
                    <textarea class="form-control" rows="4" onchange="window.updateProject(${i}, 'fullDescription', this.value)">${escapeHtml(proj.fullDescription || '')}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

window.updateProject = (index, field, value) => {
    if (!window.contentData.projects[index]) {
        window.contentData.projects[index] = {};
    }
    window.contentData.projects[index][field] = value;
    
    if (field === 'title' || field === 'media' || field === 'mediaType') {
        renderProjects();
    }
};

window.addProject = () => {
    window.contentData.projects.push({
        title: 'Nuevo Proyecto',
        location: '',
        media: 'img/',
        mediaType: 'image',
        shortDescription: '',
        fullDescription: ''
    });
    renderProjects();
    
    setTimeout(() => {
        const container = document.getElementById('projectsList');
        if (container && container.lastElementChild) {
            container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
};

window.deleteProject = async (index) => {
    if (confirm('¿Eliminar este proyecto?')) {
        window.contentData.projects.splice(index, 1);
        renderProjects();
        
        try {
            await setDoc(doc(db, 'content', 'projects'), { items: window.contentData.projects });
            showToast('Proyecto eliminado exitosamente', 'success');
        } catch (error) {
            showToast('Error al eliminar: ' + error.message, 'error');
        }
    }
};

window.saveProjects = async () => {
    showLoading(true);
    try {
        await setDoc(doc(db, 'content', 'projects'), { items: window.contentData.projects });
        showToast('Proyectos guardados exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// EQUIPO
// ============================================
function renderTeam() {
    const container = document.getElementById('teamList');
    container.innerHTML = window.contentData.team.map((member, i) => `
        <div class="item-card">
            <button class="delete-btn" onclick="window.deleteTeamMember(${i})">
                <i class="fas fa-trash"></i>
            </button>
            <h5 class="mb-3"><i class="fas fa-user me-2"></i>${escapeHtml(member.name || 'Miembro ' + (i + 1))}</h5>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" value="${escapeHtml(member.name || '')}" onchange="window.updateTeam(${i}, 'name', this.value)">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" value="${escapeHtml(member.email || '')}" onchange="window.updateTeam(${i}, 'email', this.value)">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Foto (ruta)</label>
                    <input type="text" class="form-control" value="${escapeHtml(member.photo || '')}" onchange="window.updateTeam(${i}, 'photo', this.value)" placeholder="img/team/foto.jpg">
                </div>
                ${member.photo && member.photo !== 'img/team/' ? `
                <div class="col-12 mb-3">
                    <label class="form-label">Vista previa</label>
                    <div class="preview-container">
                        <img src="${member.photo}" alt="${escapeHtml(member.name || '')}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
                    </div>
                </div>
                ` : ''}
                <div class="col-12 mb-3">
                    <label class="form-label">Biografía</label>
                    <textarea class="form-control" rows="3" onchange="window.updateTeam(${i}, 'bio', this.value)">${escapeHtml(member.bio || '')}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

window.updateTeam = (index, field, value) => {
    if (!window.contentData.team[index]) {
        window.contentData.team[index] = {};
    }
    window.contentData.team[index][field] = value;
    
    if (field === 'name' || field === 'photo') {
        renderTeam();
    }
};

window.addTeamMember = () => {
    window.contentData.team.push({ name: 'Nuevo Miembro', email: '', photo: 'img/', bio: '' });
    renderTeam();
    
    setTimeout(() => {
        const container = document.getElementById('teamList');
        if (container && container.lastElementChild) {
            container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
};

window.deleteTeamMember = async (index) => {
    if (confirm('¿Eliminar este miembro?')) {
        window.contentData.team.splice(index, 1);
        renderTeam();
        
        try {
            await setDoc(doc(db, 'content', 'team'), { items: window.contentData.team });
            showToast('Miembro eliminado exitosamente', 'success');
        } catch (error) {
            showToast('Error al eliminar: ' + error.message, 'error');
        }
    }
};

window.saveTeam = async () => {
    showLoading(true);
    try {
        await setDoc(doc(db, 'content', 'team'), { items: window.contentData.team });
        showToast('Equipo guardado exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// GALERÍA
// ============================================
function renderGallery() {
    const container = document.getElementById('galleryList');
    container.innerHTML = window.contentData.gallery.map((item, i) => `
        <div class="item-card">
            <button class="delete-btn" onclick="window.deleteGalleryItem(${i})">
                <i class="fas fa-trash"></i>
            </button>
            <h5 class="mb-3"><i class="fas fa-image me-2"></i>Item ${i + 1}</h5>
            <div class="row">
                <div class="col-md-8 mb-3">
                    <label class="form-label">Archivo (ruta)</label>
                    <input type="text" class="form-control" value="${escapeHtml(item.src || '')}" onchange="window.updateGallery(${i}, 'src', this.value)" placeholder="img/galeria/foto.jpg">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Tipo</label>
                    <div class="media-type-selector">
                        <div class="media-type-option ${item.type === 'image' ? 'active' : ''}" onclick="window.updateGallery(${i}, 'type', 'image')">
                            <i class="fas fa-image"></i>
                            <span>Imagen</span>
                        </div>
                        <div class="media-type-option ${item.type === 'video' ? 'active' : ''}" onclick="window.updateGallery(${i}, 'type', 'video')">
                            <i class="fas fa-video"></i>
                            <span>Video</span>
                        </div>
                    </div>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Descripción</label>
                    <input type="text" class="form-control" value="${escapeHtml(item.alt || '')}" onchange="window.updateGallery(${i}, 'alt', this.value)">
                </div>
                ${item.src ? `
                <div class="col-12 mb-3">
                    <label class="form-label">Vista previa</label>
                    <div class="preview-container">
                        ${item.type === 'video' ? 
                            `<video src="${item.src}" style="max-width: 100%; max-height: 200px;" controls></video>` :
                            `<img src="${item.src}" alt="${escapeHtml(item.alt || '')}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`
                        }
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

window.updateGallery = (index, field, value) => {
    if (!window.contentData.gallery[index]) {
        window.contentData.gallery[index] = {};
    }
    window.contentData.gallery[index][field] = value;
    
    if (field === 'src' || field === 'type') {
        renderGallery();
    }
};

window.addGalleryItem = () => {
    window.contentData.gallery.push({ src: 'img/', alt: '', type: 'image' });
    renderGallery();
    
    setTimeout(() => {
        const container = document.getElementById('galleryList');
        if (container && container.lastElementChild) {
            container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
};

window.deleteGalleryItem = async (index) => {
    if (confirm('¿Eliminar este item?')) {
        window.contentData.gallery.splice(index, 1);
        renderGallery();
        
        try {
            await setDoc(doc(db, 'content', 'gallery'), { items: window.contentData.gallery });
            showToast('Item eliminado exitosamente', 'success');
        } catch (error) {
            showToast('Error al eliminar: ' + error.message, 'error');
        }
    }
};

window.saveGallery = async () => {
    showLoading(true);
    try {
        await setDoc(doc(db, 'content', 'gallery'), { items: window.contentData.gallery });
        showToast('Galería guardada exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// NOTICIAS
// ============================================
function renderNews() {
    const container = document.getElementById('newsList');
    container.innerHTML = window.contentData.news.map((item, i) => `
        <div class="item-card">
            <button class="delete-btn" onclick="window.deleteNews(${i})">
                <i class="fas fa-trash"></i>
            </button>
            <h5 class="mb-3"><i class="fas fa-newspaper me-2"></i>${escapeHtml(item.title || 'Noticia ' + (i + 1))}</h5>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-control" value="${escapeHtml(item.title || '')}" onchange="window.updateNews(${i}, 'title', this.value)">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Fecha</label>
                    <input type="text" class="form-control" value="${escapeHtml(item.date || '')}" onchange="window.updateNews(${i}, 'date', this.value)" placeholder="15 de junio, 2024">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Imagen (ruta)</label>
                    <input type="text" class="form-control" value="${escapeHtml(item.image || '')}" onchange="window.updateNews(${i}, 'image', this.value)" placeholder="img/news/noticia.jpg">
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Resumen Corto</label>
                    <textarea class="form-control" rows="2" onchange="window.updateNews(${i}, 'summary', this.value)" placeholder="Descripción breve que aparece en la tarjeta">${escapeHtml(item.summary || '')}</textarea>
                    <small class="text-muted">Este texto aparece en la tarjeta principal</small>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Descripción Completa</label>
                    <textarea class="form-control" rows="4" onchange="window.updateNews(${i}, 'fullDescription', this.value)" placeholder="Descripción completa que aparece en el modal">${escapeHtml(item.fullDescription || '')}</textarea>
                    <small class="text-muted">Este texto aparece al hacer clic en "Leer más"</small>
                </div>
                ${item.image ? `
                <div class="col-12 mb-3">
                    <label class="form-label">Vista previa</label>
                    <div class="preview-container">
                        <img src="${item.image}" alt="${escapeHtml(item.title || '')}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

window.updateNews = (index, field, value) => {
    if (!window.contentData.news[index]) {
        window.contentData.news[index] = {};
    }
    window.contentData.news[index][field] = value;
    
    if (field === 'title' || field === 'image') {
        renderNews();
    }
};

window.addNews = () => {
    window.contentData.news.push({ 
        title: 'Nueva Noticia', 
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 
        image: 'img/', 
        summary: '',
        fullDescription: ''
    });
    renderNews();
    
    setTimeout(() => {
        const container = document.getElementById('newsList');
        if (container && container.lastElementChild) {
            container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
};

window.deleteNews = async (index) => {
    if (confirm('¿Eliminar esta noticia?')) {
        window.contentData.news.splice(index, 1);
        renderNews();
        
        try {
            await setDoc(doc(db, 'content', 'news'), { items: window.contentData.news });
            showToast('Noticia eliminada exitosamente', 'success');
        } catch (error) {
            showToast('Error al eliminar: ' + error.message, 'error');
        }
    }
};

window.saveNews = async () => {
    showLoading(true);
    try {
        await setDoc(doc(db, 'content', 'news'), { items: window.contentData.news });
        showToast('Noticias guardadas exitosamente', 'success');
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
    showLoading(false);
};

// ============================================
// DONACIONES
// ============================================
window.renderDonations = () => {
    const donations = window.contentData.donations || {
        title: 'Cómo Donar',
        description: 'Tu apoyo nos permite continuar con nuestros proyectos de conservación.',
        accounts: []
    };
    
    const container = document.getElementById('donationsList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card mb-4">
            <div class="card-header" style="background: linear-gradient(135deg, #3A6F2F 0%, #97BC62 100%); color: white;">
                <h5 class="mb-0">Información de Donaciones</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Título Principal</label>
                    <input type="text" class="form-control" value="${escapeHtml(donations.title || '')}"
                           onchange="window.updateDonations('title', this.value)">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" rows="3"
                              onchange="window.updateDonations('description', this.value)">${escapeHtml(donations.description || '')}</textarea>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Cuentas Bancarias</h5>
                <button class="btn btn-sm btn-dorado" onclick="window.addAccount()">
                    <i class="fas fa-plus"></i> Agregar Cuenta
                </button>
            </div>
            <div class="card-body">
                <div id="accountsList"></div>
            </div>
        </div>
    `;
    
    renderAccounts();
};

window.renderAccounts = () => {
    const donations = window.contentData.donations || { accounts: [] };
    const container = document.getElementById('accountsList');
    if (!container) return;
    
    if (!donations.accounts || donations.accounts.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay cuentas agregadas. Haz clic en "Agregar Cuenta" para comenzar.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    donations.accounts.forEach((account, i) => {
        const card = document.createElement('div');
        card.className = 'item-card mb-3';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5>Cuenta ${i + 1}</h5>
                <button class="delete-btn" onclick="window.deleteAccount(${i})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Banco</label>
                    <input type="text" class="form-control" value="${escapeHtml(account.bank || '')}"
                           onchange="window.updateAccount(${i}, 'bank', this.value)"
                           placeholder="Ej: Banco Pichincha">
                </div>
                
                <div class="col-md-6 mb-3">
                    <label class="form-label">Tipo de Cuenta</label>
                    <select class="form-control" onchange="window.updateAccount(${i}, 'type', this.value)">
                        <option value="Ahorros" ${account.type === 'Ahorros' ? 'selected' : ''}>Ahorros</option>
                        <option value="Corriente" ${account.type === 'Corriente' ? 'selected' : ''}>Corriente</option>
                    </select>
                </div>
                
                <div class="col-md-6 mb-3">
                    <label class="form-label">Número de Cuenta</label>
                    <input type="text" class="form-control" value="${escapeHtml(account.number || '')}"
                           onchange="window.updateAccount(${i}, 'number', this.value)"
                           placeholder="Ej: 1234567890">
                </div>
                
                <div class="col-md-6 mb-3">
                    <label class="form-label">Titular (opcional)</label>
                    <input type="text" class="form-control" value="${escapeHtml(account.holder || '')}"
                           onchange="window.updateAccount(${i}, 'holder', this.value)"
                           placeholder="Ej: Yemanyá - Agua y Conservación">
                </div>
                
                <div class="col-md-6 mb-3">
                    <label class="form-label">RUC/Cédula (opcional)</label>
                    <input type="text" class="form-control" value="${escapeHtml(account.id || '')}"
                           onchange="window.updateAccount(${i}, 'id', this.value)"
                           placeholder="Ej: 1234567890001">
                </div>
                
                <div class="col-md-6 mb-3">
                    <label class="form-label">Correo (opcional)</label>
                    <input type="email" class="form-control" value="${escapeHtml(account.email || '')}"
                           onchange="window.updateAccount(${i}, 'email', this.value)"
                           placeholder="Ej: donaciones@somosyemanya.org">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};

window.updateDonations = (field, value) => {
    if (!window.contentData.donations) {
        window.contentData.donations = { title: '', description: '', accounts: [] };
    }
    window.contentData.donations[field] = value;
};

window.addAccount = () => {
    if (!window.contentData.donations) {
        window.contentData.donations = { title: '', description: '', accounts: [] };
    }
    if (!window.contentData.donations.accounts) {
        window.contentData.donations.accounts = [];
    }
    window.contentData.donations.accounts.push({
        bank: '',
        type: 'Ahorros',
        number: '',
        holder: '',
        id: '',
        email: ''
    });
    renderAccounts();
};

window.updateAccount = (index, field, value) => {
    if (!window.contentData.donations.accounts[index]) return;
    window.contentData.donations.accounts[index][field] = value;
};

window.deleteAccount = (index) => {
    if (confirm('¿Eliminar esta cuenta?')) {
        window.contentData.donations.accounts.splice(index, 1);
        renderAccounts();
    }
};

window.saveDonations = async () => {
    try {
        showLoading(true);
        await setDoc(doc(db, 'content', 'donations'), window.contentData.donations);
        showToast('Información de donaciones guardada exitosamente', 'success');
        showLoading(false);
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
        showLoading(false);
        console.error('Error:', error);
    }
};

// ============================================
// CONTACTO
// ============================================
window.renderContact = () => {
    const contact = window.contentData.contact || {
        address: 'Esmeraldas, Ecuador',
        email: 'info@somosyemanya.org',
        website: 'www.somosyemanya.org',
        phone: ''
    };
    
    const container = document.getElementById('contactForm');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header" style="background: linear-gradient(135deg, #3A6F2F 0%, #97BC62 100%); color: white;">
                <h5 class="mb-0">Información de Contacto</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Dirección</label>
                    <input type="text" class="form-control" value="${escapeHtml(contact.address || '')}"
                           onchange="window.updateContact('address', this.value)"
                           placeholder="Ej: Esmeraldas, Ecuador">
                    <small class="text-muted">Dirección física de la organización</small>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" value="${escapeHtml(contact.email || '')}"
                           onchange="window.updateContact('email', this.value)"
                           placeholder="Ej: info@somosyemanya.org">
                    <small class="text-muted">Email principal de contacto</small>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Teléfono (opcional)</label>
                    <input type="text" class="form-control" value="${escapeHtml(contact.phone || '')}"
                           onchange="window.updateContact('phone', this.value)"
                           placeholder="Ej: +593 99 123 4567">
                    <small class="text-muted">Número de teléfono de contacto</small>
                </div>
            </div>
        </div>
    `;
};

window.updateContact = (field, value) => {
    if (!window.contentData.contact) {
        window.contentData.contact = {};
    }
    window.contentData.contact[field] = value;
};

window.saveContact = async () => {
    try {
        showLoading(true);
        await setDoc(doc(db, 'content', 'contact'), window.contentData.contact);
        showToast('Información de contacto guardada exitosamente', 'success');
        showLoading(false);
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
        showLoading(false);
        console.error('Error:', error);
    }
};

// ============================================
// UTILIDADES
// ============================================
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.style.cssText = 'min-width: 300px; margin-bottom: 10px;';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}