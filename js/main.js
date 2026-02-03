/* ========================================================================
   YEMANYÁ - JAVASCRIPT PRINCIPAL
   Archivo: js/main.js
   
   FUNCIONALIDADES:
   - Efecto de scroll en navegación
   - Smooth scroll para enlaces internos
   - Animación de contadores en estadísticas
   - Animaciones de fade-in al hacer scroll
   - Reproducción automática de videos en carrusel
   ======================================================================== */

// ========================================================================
// NAVBAR: Efecto de scroll
// ========================================================================
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================================================================
// SMOOTH SCROLLING: Para enlaces de navegación
// ========================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Cerrar el menú móvil si está abierto
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
});

// ========================================================================
// CONTADORES ANIMADOS: Para la sección de estadísticas
// EDITA AQUÍ: Cambia la velocidad de animación si lo necesitas
// ========================================================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Menor número = más rápido
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounters(), 10);
        } else {
            counter.innerText = target;
        }
    });
}

// ========================================================================
// TRIGGER: Activar animación de contadores cuando la sección sea visible
// ========================================================================
const statsSection = document.querySelector('.stats-section');
let statsAnimated = false;

window.addEventListener('scroll', () => {
    if (!statsAnimated && isInViewport(statsSection)) {
        animateCounters();
        statsAnimated = true;
    }
});

// ========================================================================
// FUNCIÓN AUXILIAR: Verificar si un elemento está en el viewport
// ========================================================================
function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= window.innerHeight && 
        rect.bottom >= 0
    );
}

// ========================================================================
// FADE-IN: Animación de aparición al hacer scroll
// ========================================================================
function checkFadeIn() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkFadeIn);
window.addEventListener('load', checkFadeIn);

// ========================================================================
// CARRUSEL: Reproducción automática de videos
// ========================================================================
document.addEventListener('DOMContentLoaded', function() {
    const heroCarousel = document.querySelector('#heroCarousel');
    
    if (heroCarousel) {
        heroCarousel.addEventListener('slide.bs.carousel', function (event) {
            // Pausar todos los videos
            const videos = document.querySelectorAll('.carousel-item video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
            
            // Reproducir el video del slide activo
            const activeVideo = event.relatedTarget.querySelector('video');
            if (activeVideo) {
                activeVideo.play();
            }
        });
        
        // Reproducir el video del primer slide al cargar
        const firstVideo = document.querySelector('.carousel-item.active video');
        if (firstVideo) {
            firstVideo.play();
        }
    }
});

// ========================================================================
// PROJECT CARDS: Hover en videos de proyectos
// ========================================================================
document.querySelectorAll('.project-card video').forEach(video => {
    const card = video.closest('.project-card');
    
    card.addEventListener('mouseenter', function() {
        if (video.paused) {
            video.play();
        }
    });
    
    card.addEventListener('mouseleave', function() {
        video.pause();
        video.currentTime = 0;
    });
});

// ========================================================================
// CONSOLE: Mensaje de bienvenida (opcional)
// ========================================================================
console.log('%c🌊 Yemanyá - Agua y Conservación', 'color: #2a8c5a; font-size: 20px; font-weight: bold;');
console.log('%cSitio web desarrollado con ❤️ para la conservación de ecosistemas acuáticos', 'color: #3498db; font-size: 12px;');