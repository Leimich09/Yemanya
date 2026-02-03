// ============================================
// GALERÍA - Lightbox + Modal + Z-Index correcto
// Archivo: js/gallery.js
// ============================================

let currentImageIndex = 0;

// ============================================
// LIGHTBOX - ABRIR
// ============================================
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const imgElement = document.getElementById('lightbox-img');
    const videoElement = document.getElementById('lightbox-video');
    const caption = document.getElementById('lightbox-caption');
    const counter = document.getElementById('lightbox-counter');
    
    const item = window.galleryImages[index];
    if (!item) return;
    
    if (item.type === 'video') {
        imgElement.style.display = 'none';
        videoElement.style.display = 'block';
        videoElement.src = item.src;
        videoElement.load();
        videoElement.play();
    } else {
        videoElement.style.display = 'none';
        videoElement.pause();
        videoElement.src = '';
        imgElement.style.display = 'block';
        imgElement.src = item.src;
    }
    
    caption.textContent = item.alt || '';
    counter.textContent = `${index + 1} / ${window.galleryImages.length}`;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ============================================
// LIGHTBOX - CERRAR
// ============================================
function closeLightbox() {
    const videoElement = document.getElementById('lightbox-video');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
    }
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// LIGHTBOX - NAVEGAR
// ============================================
function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex >= window.galleryImages.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = window.galleryImages.length - 1;
    openLightbox(currentImageIndex);
}

// ============================================
// TECLADO
// ============================================
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') changeImage(1);
        if (e.key === 'ArrowLeft') changeImage(-1);
    }
});

// ============================================
// MODAL GALERÍA COMPLETA - con lazy loading
// ============================================
function openGalleryModal() {
    const modalElement = document.getElementById('galleryModal');
    const modal = new bootstrap.Modal(modalElement);
    const grid = document.getElementById('full-gallery-grid');
    
    grid.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    window.galleryImages.forEach((item, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-6 mb-3';
        
        let mediaHTML = '';
        if (item.type === 'video') {
            mediaHTML = `
                <video class="img-fluid" muted preload="none">
                    <source src="${item.src}" type="video/mp4">
                </video>
                <div class="video-play-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        } else {
            // Placeholder mientras carga
            mediaHTML = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 180'%3E%3Crect fill='%23e9ecef' width='300' height='180'/%3E%3C/svg%3E" alt="${item.alt || ''}" class="img-fluid gallery-lazy" data-src="${item.src}">`;
        }
        
        col.innerHTML = `
            <div class="gallery-item" data-index="${index}" onclick="openLightboxFromModal(${index})">
                ${mediaHTML}
                <div class="gallery-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        `;
        fragment.appendChild(col);
    });
    
    grid.appendChild(fragment);
    modal.show();
    
    // Lazy loading cuando el modal ya está visible
    modalElement.addEventListener('shown.bs.modal', function handler() {
        initModalLazyLoad();
        modalElement.removeEventListener('shown.bs.modal', handler);
    });
}

// Abrir lightbox desde modal
function openLightboxFromModal(index) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('galleryModal'));
    if (modal) modal.hide();
    // Pequeño delay para que el modal se cierre antes de abrir lightbox
    setTimeout(() => openLightbox(index), 200);
}

// ============================================
// LAZY LOADING para el modal de galería
// ============================================
function initModalLazyLoad() {
    const images = document.querySelectorAll('.gallery-lazy');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.remove('gallery-lazy');
                }
                observer.unobserve(img);
            }
        });
    }, {
        root: document.querySelector('#galleryModal .modal-body'),
        rootMargin: '100px',
        threshold: 0.01
    });
    
    images.forEach(img => observer.observe(img));
}