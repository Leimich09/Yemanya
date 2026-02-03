// ============================================
// FAB FLOTANTE + GUARDAR POR SECCIÓN
// Agregar este script al final de admin.html
// (dentro de un <script> tag, NO como módulo)
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // NO MOSTRAR FAB SI ESTÁ EN LOGIN
    // ============================================
    function isLoginVisible() {
        const loginScreen = document.getElementById('loginScreen');
        if (!loginScreen) return false;
        return loginScreen.style.display !== 'none' && 
               window.getComputedStyle(loginScreen).display !== 'none';
    }

    // Si está en login, no crear el FAB
    if (isLoginVisible()) {
        // Observer para crear el FAB cuando se loguee
        const observer = new MutationObserver(function() {
            if (!isLoginVisible()) {
                createFAB();
                observer.disconnect();
            }
        });
        
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            observer.observe(loginScreen, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
        return; // No continuar con el resto del código
    }

    // Si ya está logueado, crear el FAB inmediatamente
    createFAB();

    // ============================================
    // FUNCIÓN PARA CREAR EL FAB
    // ============================================
    function createFAB() {
        // Verificar que no exista ya
        if (document.getElementById('fabAdd')) return;

        const fab = document.createElement('button');
        fab.className = 'fab-add';
        fab.id = 'fabAdd';
        fab.innerHTML = `
            <span class="fab-tooltip" id="fabTooltip">Agregar nuevo</span>
            <i class="fas fa-plus"></i>
        `;
        document.body.appendChild(fab);

        // Mostrar FAB solo cuando el usuario hace scroll hacia abajo
        let scrollThreshold = 300;

        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            // Mostrar si scrolleó más de 300px desde el tope
            if (currentScrollY > scrollThreshold) {
                fab.style.display = 'flex';
            } else {
                fab.style.display = 'none';
            }
        });

        // Click en el FAB → llama a la función correspondiente
        fab.addEventListener('click', function() {
            // Buscar qué función add está disponible según el contenido visible
            if (typeof window.addProject === 'function' && document.getElementById('projectsList') && document.getElementById('projectsList').offsetParent !== null) {
                window.addProject();
                updateFabTooltip('Proyecto agregado');
            } else if (typeof window.addTeamMember === 'function' && document.getElementById('teamList') && document.getElementById('teamList').offsetParent !== null) {
                window.addTeamMember();
                updateFabTooltip('Miembro agregado');
            } else if (typeof window.addGalleryItem === 'function' && document.getElementById('galleryList') && document.getElementById('galleryList').offsetParent !== null) {
                window.addGalleryItem();
                updateFabTooltip('Item agregado');
            } else if (typeof window.addNews === 'function' && document.getElementById('newsList') && document.getElementById('newsList').offsetParent !== null) {
                window.addNews();
                updateFabTooltip('Noticia agregada');
            }
        });

        function updateFabTooltip(text) {
            const tooltip = document.getElementById('fabTooltip');
            if (tooltip) {
                tooltip.textContent = text;
                tooltip.style.opacity = '1';
                setTimeout(() => { tooltip.style.opacity = '0'; }, 1500);
                // Volver al texto original
                setTimeout(() => { tooltip.textContent = 'Agregar nuevo'; }, 1800);
            }
        }

        // Iniciar el observer de botones guardar
        initSaveButtons();
    }

    // ============================================
    // INYECTAR BOTONES "GUARDAR" dentro de cada item-card
    // ============================================
    function initSaveButtons() {
        function injectSaveButtons() {
            const listIds = [
                { id: 'projectsList',  saveFn: 'saveProjects',  label: 'Guardar cambios' },
                { id: 'teamList',      saveFn: 'saveTeam',       label: 'Guardar cambios' },
                { id: 'galleryList',   saveFn: 'saveGallery',    label: 'Guardar cambios' },
                { id: 'newsList',      saveFn: 'saveNews',       label: 'Guardar cambios' }
            ];

            listIds.forEach(({ id, saveFn, label }) => {
                const container = document.getElementById(id);
                if (!container) return;

                // Agregar botón guardar a cada item-card que no lo tenga
                const cards = container.querySelectorAll('.item-card');
                cards.forEach(card => {
                    if (card.querySelector('.section-save-btn')) return; // Ya tiene botón

                    const saveDiv = document.createElement('div');
                    saveDiv.className = 'section-save-btn';
                    saveDiv.innerHTML = `
                        <button class="btn-guardar" onclick="window.${saveFn}()">
                            <i class="fas fa-save"></i> ${label}
                        </button>
                    `;
                    card.appendChild(saveDiv);
                });
            });
        }

        // MutationObserver para inyectar botones cuando se renderiza contenido
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Pequeño delay para que el DOM esté completo
                    setTimeout(injectSaveButtons, 50);
                }
            });
        });

        // Observar los contenedores principales
        ['projectsList', 'teamList', 'galleryList', 'newsList'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                observer.observe(el, { childList: true, subtree: true });
            }
        });

        // También intentar inyectar inmediatamente (por si ya están renderizados)
        setTimeout(injectSaveButtons, 500);
    }
});