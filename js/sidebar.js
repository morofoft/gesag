import { auth, db } from "./firebase/firebase.init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Inicializa la barra lateral dinámicamente y filtra los accesos según permisos
 * @param {string} containerId - ID del contenedor HTML donde se montará el sidebar
 */
export function initSidebar(containerId = "sidebar-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Renderizado base de la estructura HTML del Sidebar
    container.innerHTML = `
        <!-- Overlay Móvil -->
        <div id="sidebarBackdrop" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 hidden lg:hidden transition-opacity"></div>

        <!-- Panel Lateral -->
        <aside id="sidebar" class="fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0">
            
            <!-- Header Marca -->
            <div class="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
                <a href="index.html" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black">
                        G
                    </div>
                    <div>
                        <h1 class="text-sm font-extrabold text-white tracking-tight">Gesag<span class="text-indigo-500">PRO</span></h1>
                        <p class="text-[9px] text-slate-400 uppercase tracking-widest font-mono">v3.2.1</p>
                    </div>
                </a>
                <button id="closeSidebarMobile" class="lg:hidden text-slate-400 hover:text-white p-1" aria-label="Cerrar menú">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Navegación Principal -->
            <nav class="flex-1 overflow-y-auto p-3 space-y-1 custom-scroll">
                <p class="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider my-2">Módulos</p>

                <!-- Dashboard (Visible para todos los usuarios autenticados) -->
                <a href="index.html" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-house text-slate-400 w-4 text-center"></i>
                    <span>Inicio / Directorio</span>
                </a>

                <!-- Mapa Interactivo -->
                <a href="mapa.html" data-module="mapa" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-map-location-dot text-slate-400 w-4 text-center"></i>
                    <span>Mapa Interactivo</span>
                </a>

                <!-- Optimizador de Rutas -->
                <a href="rutas.html" data-module="rutas" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-route text-slate-400 w-4 text-center"></i>
                    <span>Optimizador de Rutas</span>
                </a>

                <!-- Agencias Cercanas GPS -->
                <a href="cercana.html" data-module="cercana" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-location-arrow text-slate-400 w-4 text-center"></i>
                    <span>Agencias Cercanas</span>
                </a>

                <!-- Generador de Impresión -->
                <a href="imprimir.html" data-module="imprimir" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-print text-slate-400 w-4 text-center"></i>
                    <span>Generador de Impresión</span>
                </a>

                <!-- Reportes y Analítica -->
                <a href="reportes.html" data-module="reportes" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-chart-pie text-slate-400 w-4 text-center"></i>
                    <span>Reportes y Analítica</span>
                </a>

                <p class="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider mt-5 mb-2">Administración</p>

                <!-- Carga / Configuración (Solo Administradores) -->
                <a href="configuracion.html" data-admin-only data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-sliders text-slate-400 w-4 text-center"></i>
                    <span>Carga / Configuración</span>
                </a>

                <!-- Sugerencias -->
                <a href="sugerencias.html" data-module="sugerencias" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-lightbulb text-slate-400 w-4 text-center"></i>
                    <span>Buzón de Ideas</span>
                </a>

                <!-- Acerca de -->
                <a href="acerca.html" data-nav-link class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <i class="fa-solid fa-circle-info text-slate-400 w-4 text-center"></i>
                    <span>Acerca de</span>
                </a>
            </nav>

            <!-- Perfil del Usuario Autenticado -->
            <div class="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0 space-y-2">
                <div class="flex items-center gap-3 px-2 py-1.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <i class="fa-solid fa-user text-xs"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <p id="sbUserEmail" class="text-xs font-bold text-slate-200 truncate">Cargando...</p>
                        <p id="sbUserRole" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">...</p>
                    </div>
                </div>

                <button id="sbBtnLogout" class="w-full py-2 bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>

        </aside>
    `;

    // Eventos UI del Menú Móvil
    setupMobileEvents();

    // Resaltar ruta activa actual
    highlightActivePage();

    // Verificación de sesión y filtrado por módulos
    setupAuthenticationAndPermissions();
}

/**
 * Eventos para abrir/cerrar sidebar en móviles
 */
function setupMobileEvents() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const closeBtn = document.getElementById("closeSidebarMobile");
    const openBtn = document.getElementById("openSidebarMobile");

    const toggle = (show) => {
        if (!sidebar || !backdrop) return;
        if (show) {
            sidebar.classList.remove("-translate-x-full");
            backdrop.classList.remove("hidden");
        } else {
            sidebar.classList.add("-translate-x-full");
            backdrop.classList.add("hidden");
        }
    };

    if (openBtn) openBtn.addEventListener("click", () => toggle(true));
    if (closeBtn) closeBtn.addEventListener("click", () => toggle(false));
    if (backdrop) backdrop.addEventListener("click", () => toggle(false));
}

/**
 * Resalta visualmente el enlace de la vista actual
 */
function highlightActivePage() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll("[data-nav-link]");

    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("bg-indigo-600/15", "text-indigo-400", "border", "border-indigo-500/30");
            link.classList.remove("text-slate-300");
            const icon = link.querySelector("i");
            if (icon) icon.classList.add("text-indigo-400");
        }
    });
}

/**
 * Consulta la información del usuario autenticado y filtra las opciones del menú
 */
function setupAuthenticationAndPermissions() {
    const userEmailSpan = document.getElementById("sbUserEmail");
    const userRoleSpan = document.getElementById("sbUserRole");
    const btnLogout = document.getElementById("sbBtnLogout");

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        if (userEmailSpan) userEmailSpan.textContent = user.email;

        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const isAdmin = userData.role === "admin";
            const userModules = Array.isArray(userData.modulos) ? userData.modulos : [];

            if (userRoleSpan) {
                userRoleSpan.textContent = isAdmin ? "Administrador" : "Visualizador";
                userRoleSpan.className = isAdmin 
                    ? "text-[10px] font-bold text-indigo-400 uppercase tracking-wider"
                    : "text-[10px] font-bold text-slate-500 uppercase tracking-wider";
            }

            // Ocultar enlaces de administración
            if (!isAdmin) {
                document.querySelectorAll("[data-admin-only]").forEach(el => el.remove());
            }

            // Ocultar enlaces de módulos sin permiso explícito
            document.querySelectorAll("[data-module]").forEach(el => {
                const moduleName = el.getAttribute("data-module");
                if (!isAdmin && !userModules.includes(moduleName)) {
                    el.remove();
                }
            });

        } catch (err) {
            console.error("[Sidebar] Error al verificar permisos:", err);
        }
    });

    // Acción de Cierre de Sesión desde la barra lateral
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            const res = await Swal.fire({
                title: "¿Cerrar sesión?",
                text: "¿Deseas salir del sistema?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, salir",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#475569"
            });

            if (res.isConfirmed) {
                await signOut(auth);
                window.location.replace("login.html");
            }
        });
    }
}