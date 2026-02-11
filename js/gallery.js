// ============================================
// GALERÍA - VERSIÓN FINAL CORREGIDA
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
    
    // IMPORTANTE: Lightbox por encima del modal
    lightbox.style.display = 'flex';
    lightbox.style.zIndex = '10000'; // Por encima del modal (1055)
    
    // NO bloqueamos scroll si hay modal abierto
    const modalOpen = document.querySelector('.modal.show');
    if (!modalOpen) {
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// LIGHTBOX - CERRAR (sin cerrar el modal)
// ============================================
function closeLightbox() {
    const videoElement = document.getElementById('lightbox-video');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
    }
    
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    
    // Solo restauramos scroll si NO hay modal abierto
    const modalOpen = document.querySelector('.modal.show');
    if (!modalOpen) {
        document.body.style.overflow = 'auto';
    }
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
// MODAL GALERÍA COMPLETA - SIN CERRAR
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
            // Video con ícono de play CENTRADO
            mediaHTML = `
                <div style="position: relative; width: 100%; height: 200px; background: #e0e0e0;">
                    <video class="img-fluid" muted preload="metadata" style="width:100%; height:200px; object-fit:cover;">
                        <source src="${item.src}#t=0.5" type="video/mp4">
                    </video>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;">
                        <i class="fas fa-play-circle" style="font-size: 48px; color: rgba(255,255,255,0.9); text-shadow: 0 2px 8px rgba(0,0,0,0.5);"></i>
                    </div>
                </div>
            `;
        } else {
            mediaHTML = `<img src="${item.src}" alt="${item.alt || ''}" class="img-fluid" style="width:100%; height:200px; object-fit:cover;">`;
        }
        
        col.innerHTML = `
            <div class="gallery-item" onclick="openLightboxFromModal(${index})">
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
}

// Abrir lightbox DESDE modal (SIN cerrar el modal)
function openLightboxFromModal(index) {
    // NO cerramos el modal, solo abrimos el lightbox encima
    openLightbox(index);
}

// ============================================
// Cerrar lightbox al hacer clic en el fondo negro
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            // Solo cerrar si hacen clic en el fondo negro (no en la imagen)
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
});