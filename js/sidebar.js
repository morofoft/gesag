// js/sidebar.js
import { db, auth } from "./firebase/firebase.init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function initSidebar(containerId = "sidebar-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Detectar página actual para marcarla como activa automáticamente
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    const isActive = (page) => currentPath === page;

    // Estilos para enlaces activos vs inactivos
    const linkClass = (page) => isActive(page)
        ? "flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-brand-600/10 text-brand-400 font-semibold text-xs border border-brand-500/20 shadow-sm transition-all"
        : "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 text-xs font-medium transition-all";

    container.innerHTML = `
        <!-- BACKDROP MOBILE (sidebar) -->
        <div id="mobileBackdrop" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 hidden lg:hidden"></div>

        <!-- SIDEBAR HTML -->
        <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out backdrop-blur-xl shrink-0">
            <div>
                <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center text-white shadow-lg shadow-brand-500/10">
                            <svg class="w-5 h-6 text-brand-400 fill-current" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <g>
                                    <rect x="0" y="0" width="18" height="130" rx="4" />
                                    <rect x="26" y="0" width="18" height="70" rx="4" />
                                    <rect x="52" y="0" width="18" height="130" rx="4" />
                                    <rect x="78" y="0" width="18" height="38" rx="4" />
                                    <rect x="78" y="68" width="18" height="62" rx="4" />
                                </g>
                            </svg>
                        </div>
                        <div>
                            <h1 class="font-bold text-sm tracking-wide text-white">Gesag<span class="text-brand-500">PRO</span></h1>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pedro Garcia 2026</p>
                        </div>
                    </div>
                    <button id="closeSidebarMobile" class="lg:hidden text-slate-400 hover:text-white text-lg" aria-label="Cerrar menú">
                        <i class="fa fa-xmark"></i>
                    </button>
                </div>

                <nav class="p-4 space-y-1.5 custom-scroll overflow-y-auto max-h-[calc(100vh-140px)]">
                    <p class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menú Principal</p>

                    <a href="index.html" class="${linkClass('index.html')}">
                        <i class="fa fa-house w-4 text-center text-sm"></i>
                        <span>Inicio</span>
                    </a>
                    <a href="mapa.html" class="${linkClass('mapa.html')}">
                        <i class="fa fa-map-location-dot w-4 text-center text-sm"></i>
                        <span>Mapa de Agencias</span>
                    </a>
                    <a href="rutas.html" class="${linkClass('rutas.html')}">
                        <i class="fa fa-route w-4 text-center text-sm"></i>
                        <span>Optimizador de Rutas</span>
                    </a>
                    <a href="cercana.html" class="${linkClass('cercana.html')}">
                        <i class="fa fa-route w-4 text-center text-sm"></i>
                        <span>Agencias cercana</span>
                    </a>
                    <a href="imprimir.html" class="${linkClass('imprimir.html')}">
                        <i class="fa fa-route w-4 text-center text-sm"></i>
                        <span>Imprimir</span>
                    </a>
                    <a href="zonas.html" data-admin-only class="${linkClass('zonas.html')}">
                        <i class="fa fa-layer-group w-4 text-center text-sm"></i>
                        <span>Gestión de Zonas</span>
                    </a>
                    <a href="sugerencias.html" data-admin-only class="${linkClass('sugerencias.html')}">
                        <i class="fa fa-layer-group w-4 text-center text-sm"></i>
                        <span>Sugerencias</span>
                    </a>

                    <p class="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500" data-admin-only>Administración</p>

                    <a href="users.html" data-admin-only class="${linkClass('users.html')}">
                        <i class="fa fa-users-gear w-4 text-center text-sm"></i>
                        <span>Usuarios y Permisos</span>
                    </a>
                    <a href="reportes.html" class="${linkClass('reportes.html')}">
                        <i class="fa fa-chart-pie w-4 text-center text-sm"></i>
                        <span>Reportes</span>
                    </a>
                    <a href="configuracion.html" data-admin-only class="${linkClass('configuracion.html')}">
                        <i class="fa fa-sliders w-4 text-center text-sm"></i>
                        <span>Configuración</span>
                    </a>
                    
                    <p class="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Sistema</p>
                    <a href="acerca.html" class="${linkClass('acerca.html')}">
                        <i class="fa fa-circle-info w-4 text-center text-sm"></i>
                        <span>Acerca de</span>
                    </a>
                </nav>
            </div>

            <div class="p-4 border-t border-slate-800/80 bg-slate-900/50">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                            <i class="fa fa-user"></i>
                        </div>
                        <div class="min-w-0">
                            <p id="userEmail" class="text-xs font-semibold text-slate-200 truncate">Cargando...</p>
                            <p id="userRole" class="text-[10px] text-slate-500">Sesión Activa</p>
                        </div>
                    </div>
                    <button id="btnLogout" class="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors" title="Cerrar Sesión" aria-label="Cerrar Sesión">
                        <i class="fa fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        </aside>
    `;

    // Conectar eventos del menú móvil y sesión de Firebase
    bindSidebarEvents();
}

function bindSidebarEvents() {
    const sidebar = document.getElementById("sidebar");
    const openSidebarMobile = document.getElementById("openSidebarMobile");
    const closeSidebarMobile = document.getElementById("closeSidebarMobile");
    const mobileBackdrop = document.getElementById("mobileBackdrop");
    const userEmailSpan = document.getElementById("userEmail");
    const userRoleSpan = document.getElementById("userRole");
    const btnLogout = document.getElementById("btnLogout");

    openSidebarMobile?.addEventListener("click", () => {
        sidebar.classList.remove("-translate-x-full");
        mobileBackdrop.classList.remove("hidden");
    });
    const closeSidebar = () => {
        sidebar.classList.add("-translate-x-full");
        mobileBackdrop.classList.add("hidden");
    };
    closeSidebarMobile?.addEventListener("click", closeSidebar);
    mobileBackdrop?.addEventListener("click", closeSidebar);

    // Estado de autenticación y roles para el sidebar
    onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        userEmailSpan.innerText = user.email;
        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const isAdmin = userData.role === "admin";
                userRoleSpan.innerText = isAdmin ? "Administrador" : "Visualizador";
                if (!isAdmin) {
                    document.querySelectorAll("[data-admin-only]").forEach(el => el.remove());
                }
            }
        } catch (err) {
            console.error("Error cargando rol en sidebar:", err);
        }
    });

    // Evento de cierre de sesión unificado
    btnLogout.addEventListener("click", async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Seguro que deseas cerrar sesión?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await signOut(auth);
            await Swal.fire({
                title: "¡Sesión cerrada!",
                text: "Has cerrado sesión correctamente.",
                icon: "success",
                timer: 1200,
                showConfirmButton: false,
                allowOutsideClick: false
            });
            window.location.replace("login.html");
        } catch (error) {
            Swal.fire("Error", "No se pudo cerrar la sesión.", "error");
        }
    });
}