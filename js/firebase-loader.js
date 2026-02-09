// ============================================
// FIREBASE CONTENT LOADER - COMPLETO
// Archivo: js/firebase-loader.js
// ============================================

import { db, doc, getDoc } from './firebase-config.js';

// Cargar todo el contenido cuando la página esté lista
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Firebase] Cargando contenido...');
    
    try {
        await Promise.all([
            loadStats(),
            loadAbout(),
            loadProjects(),
            loadTeam(),
            loadGallery(),
            loadNews(),
            loadDonations(),
            loadContact()
        ]);
        
        console.log('[Firebase] Contenido cargado');
    } catch (error) {
        console.error('[Firebase] Error:', error);
    }
});

// ============================================
// ESTADÍSTICAS
// ============================================
async function loadStats() {
    try {
        const statsDoc = await getDoc(doc(db, 'content', 'stats'));
        if (statsDoc.exists()) {
            const stats = statsDoc.data();
            animateCounter(0, stats.experience || 30);
            animateCounter(1, stats.projects || 15);
            animateCounter(2, stats.communities || 50);
            animateCounter(3, stats.area || 1000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateCounter(index, target) {
    const elements = document.querySelectorAll('.stat-number');
    if (!elements[index]) return;
    const element = elements[index];
    const increment = target / 200;
    let current = 0;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.ceil(current);
        }
    }, 10);
}

// ============================================
// ACERCA DE
// ============================================
async function loadAbout() {
    try {
        const aboutDoc = await getDoc(doc(db, 'content', 'about'));
        if (aboutDoc.exists()) {
            const about = aboutDoc.data();
            const contentContainer = document.querySelector('#about .col-lg-6 .fade-in');
            if (contentContainer && about.content) {
                const paragraphs = about.content.split('\n\n').filter(p => p.trim());
                contentContainer.innerHTML = `
                    <h2 class="section-title text-start">${escapeHtml(about.title || '¿Quiénes somos?')}</h2>
                    ${paragraphs.map(p => `<p class="text-justify">${escapeHtml(p)}</p>`).join('')}
                    <div class="mt-4">
                        <a href="#services" class="btn btn-primary me-3">Nuestros Servicios</a>
                        <a href="#team" class="btn btn-outline-primary">Conoce al Equipo</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

// ============================================
// PROYECTOS
// ============================================
async function loadProjects() {
    try {
        const projectsDoc = await getDoc(doc(db, 'content', 'projects'));
        if (projectsDoc.exists()) {
            const projects = projectsDoc.data().items || [];
            const container = document.querySelector('#projects .row:last-child');
            if (!container) return;
            container.innerHTML = '';
            
            projects.forEach((project, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 mb-4';
                const mediaHTML = project.mediaType === 'video' 
                    ? `<video src="${project.media}" width="100%" muted></video>`
                    : `<img src="${project.media}" alt="${escapeHtml(project.title)}">`;
                
                col.innerHTML = `
                    <div class="project-card fade-in h-100">
                        ${mediaHTML}
                        <div class="card-body d-flex flex-column">
                            <h4>${escapeHtml(project.title)}</h4>
                            <div class="project-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(project.location)}</div>
                            <p class="flex-grow-1">${escapeHtml(project.shortDescription)}</p>
                            <button class="btn btn-sm btn-outline-primary mt-auto" data-bs-toggle="modal" data-bs-target="#projectModal${index + 1}">Leer más</button>
                        </div>
                    </div>
                `;
                container.appendChild(col);
                createProjectModal(project, index + 1);
            });
            checkFadeIn();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function createProjectModal(project, index) {
    let modal = document.getElementById(`projectModal${index}`);
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = `projectModal${index}`;
        modal.setAttribute('tabindex', '-1');
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${escapeHtml(project.title)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${(project.fullDescription || '').split('\n\n').map(p => `<p class="text-justify">${escapeHtml(p)}</p>`).join('')}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// EQUIPO
// ============================================
async function loadTeam() {
    try {
        const teamDoc = await getDoc(doc(db, 'content', 'team'));
        if (teamDoc.exists()) {
            const team = teamDoc.data().items || [];
            const container = document.querySelector('#team .row:last-child');
            if (!container) return;
            container.innerHTML = '';
            
            team.forEach((member, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 mb-4';
                col.innerHTML = `
                    <div class="team-card fade-in h-100">
                        <img src="${member.photo}" alt="${escapeHtml(member.name)}">
                        <div class="card-body d-flex flex-column">
                            <h4>${escapeHtml(member.name)}</h4>
                            <div class="team-email"><i class="fas fa-envelope"></i> <a href="mailto:${member.email}">${escapeHtml(member.email)}</a></div>
                            <button class="btn btn-sm btn-outline-primary mt-3" data-bs-toggle="modal" data-bs-target="#teamModal${index + 1}">Ver más</button>
                        </div>
                    </div>
                `;
                container.appendChild(col);
                createTeamModal(member, index + 1);
            });
            checkFadeIn();
        }
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

function createTeamModal(member, index) {
    let modal = document.getElementById(`teamModal${index}`);
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = `teamModal${index}`;
        modal.setAttribute('tabindex', '-1');
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${escapeHtml(member.name)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-justify">${escapeHtml(member.bio)}</p>
                    <p><strong>Email:</strong> <a href="mailto:${member.email}">${escapeHtml(member.email)}</a></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// GALERÍA
// ============================================
async function loadGallery() {
    try {
        const galleryDoc = await getDoc(doc(db, 'content', 'gallery'));
        if (galleryDoc.exists()) {
            const gallery = galleryDoc.data().items || [];
            
            window.galleryImages = gallery;
            
            const previewContainer = document.getElementById('gallery-preview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
                
                gallery.slice(0, 8).forEach((item, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-3 col-md-4 col-6 mb-4';
                    
                    let mediaHTML = '';
                    if (item.type === 'video') {
                        mediaHTML = `
                            <video class="img-fluid" muted preload="none" style="width:100%; height:200px; object-fit:cover;">
                                <source src="${item.src}" type="video/mp4">
                            </video>
                            <div class="video-play-icon">
                                <i class="fas fa-play-circle"></i>
                            </div>
                        `;
                    } else {
                        mediaHTML = `<img src="${item.src}" alt="${escapeHtml(item.alt)}" class="img-fluid" style="width:100%; height:200px; object-fit:cover;">`;
                    }
                    
                    col.innerHTML = `
                        <div class="gallery-item fade-in" onclick="openLightbox(${index})">
                            ${mediaHTML}
                            <div class="gallery-overlay">
                                <i class="fas fa-search-plus"></i>
                            </div>
                        </div>
                    `;
                    previewContainer.appendChild(col);
                });
                
                const photoCount = document.getElementById('photo-count');
                if (photoCount) photoCount.textContent = gallery.length;
            }
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

// ============================================
// NOTICIAS
// ============================================
async function loadNews() {
    try {
        const newsDoc = await getDoc(doc(db, 'content', 'news'));
        if (newsDoc.exists()) {
            const news = newsDoc.data().items || [];
            const container = document.querySelector('#news .row:last-child');
            if (!container) return;
            container.innerHTML = '';
            
            news.forEach((item, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 mb-4';
                col.innerHTML = `
                    <div class="project-card fade-in h-100">
                        <img src="${item.image}" alt="${escapeHtml(item.title)}">
                        <div class="card-body d-flex flex-column">
                            <div class="text-muted small mb-2">${escapeHtml(item.date)}</div>
                            <h4>${escapeHtml(item.title)}</h4>
                            <p class="flex-grow-1">${escapeHtml(item.summary)}</p>
                            <button class="btn btn-sm btn-outline-primary mt-auto" data-bs-toggle="modal" data-bs-target="#newsModal${index + 1}">Leer más</button>
                        </div>
                    </div>
                `;
                container.appendChild(col);
                createNewsModal(item, index + 1);
            });
            checkFadeIn();
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function createNewsModal(newsItem, index) {
    let modal = document.getElementById(`newsModal${index}`);
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = `newsModal${index}`;
        modal.setAttribute('tabindex', '-1');
        document.body.appendChild(modal);
    }
    const description = newsItem.fullDescription || newsItem.summary || '';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${escapeHtml(newsItem.title)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-muted small mb-3">${escapeHtml(newsItem.date)}</div>
                    <img src="${newsItem.image}" alt="${escapeHtml(newsItem.title)}" class="img-fluid rounded mb-4">
                    ${description.split('\n\n').map(p => `<p class="text-justify">${escapeHtml(p)}</p>`).join('')}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// DONACIONES
// ============================================
async function loadDonations() {
    try {
        const donationsDoc = await getDoc(doc(db, 'content', 'donations'));
        if (donationsDoc.exists()) {
            const donations = donationsDoc.data();
            const container = document.getElementById('donations-content');
            if (!container) return;
            
            let html = `
                <h3 class="mb-4">${escapeHtml(donations.title || 'Cómo Donar')}</h3>
                <p class="lead mb-4">${escapeHtml(donations.description || '')}</p>
            `;
            
            if (donations.accounts && donations.accounts.length > 0) {
                html += '<div class="donations-accounts">';
                
                donations.accounts.forEach((account, index) => {
                    html += `
                        <div class="donation-account-card ${index > 0 ? 'mt-4' : ''}">
                            <h5 class="text-primary mb-3">
                                <i class="fas fa-university me-2"></i>${escapeHtml(account.bank || 'Banco')}
                            </h5>
                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <strong>Tipo:</strong> ${escapeHtml(account.type || 'Ahorros')}
                                </div>
                                <div class="col-md-6 mb-2">
                                    <strong>Cuenta:</strong> ${escapeHtml(account.number || '')}
                                </div>
                                ${account.holder ? `
                                <div class="col-md-6 mb-2">
                                    <strong>Titular:</strong> ${escapeHtml(account.holder)}
                                </div>
                                ` : ''}
                                ${account.id ? `
                                <div class="col-md-6 mb-2">
                                    <strong>RUC/Cédula:</strong> ${escapeHtml(account.id)}
                                </div>
                                ` : ''}
                                ${account.email ? `
                                <div class="col-12 mb-2">
                                    <strong>Email:</strong> <a href="mailto:${account.email}">${escapeHtml(account.email)}</a>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
            } else {
                html += '<p class="text-muted">Información de cuentas próximamente disponible.</p>';
            }
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

// ============================================
// CONTACTO
// ============================================
async function loadContact() {
    try {
        const contactDoc = await getDoc(doc(db, 'content', 'contact'));
        if (contactDoc.exists()) {
            const contact = contactDoc.data();
            
            const addressEl = document.querySelector('#contact .col-lg-4:nth-child(1) p');
            if (addressEl && contact.address) {
                addressEl.textContent = contact.address;
            }
            
            const emailEl = document.querySelector('#contact .col-lg-4:nth-child(2) p a');
            if (emailEl && contact.email) {
                emailEl.href = `mailto:${contact.email}`;
                emailEl.textContent = contact.email;
            }
            
            const phoneEl = document.getElementById('contact-phone');
            if (phoneEl && contact.phone) {
                phoneEl.innerHTML = `<a href="tel:${contact.phone}">${escapeHtml(contact.phone)}</a>`;
            }
        }
    } catch (error) {
        console.error('Error loading contact:', error);
    }
}

// ============================================
// UTILIDADES
// ============================================
function checkFadeIn() {
    if (typeof window.checkFadeIn === 'function') {
        window.checkFadeIn();
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}