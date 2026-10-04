/**
 * ────────────────────────────────────────────────────────────────
 * auth.guard.js
 * Sistema de protección de rutas + caché del perfil de usuario.
 *
 * USO EN HTML:
 *
 *   <!-- Solo requiere login -->
 *   <script type="module">
 *     import { requireAuth } from "./js/auth.guard.js";
 *     requireAuth();
 *   </script>
 *
 *   <!-- Requiere rol admin -->
 *   <script type="module">
 *     import { requireAdmin } from "./js/auth.guard.js";
 *     requireAdmin();
 *   </script>
 *
 *   <!-- Uso avanzado: esperar el resultado -->
 *   <script type="module">
 *     import { requireAdmin, getCurrentProfile } from "./js/auth.guard.js";
 *     const session = await requireAdmin();  // Top-level await
 *     if (session) {
 *       console.log("Hola admin:", getCurrentProfile().username);
 *     }
 *   </script>
 *
 * IMPORTANTE:
 *   - Guarda el resultado en caché. Puedes importar `getCurrentProfile()`
 *     en cualquier otro script y obtener el perfil SIN volver a leer Firestore.
 *   - Los redirects usan `location.replace()` para no contaminar el historial.
 *   - Verifica `enabled` automáticamente. Los usuarios inhabilitados son
 *     deslogueados y redirigidos.
 * ────────────────────────────────────────────────────────────────
 */

import { db, auth } from "./firebase/firebase.init.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ────────────────────────────────────────────────
// CACHÉ DE SESIÓN
// ────────────────────────────────────────────────
// Resolvemos el estado UNA sola vez por carga de página. Múltiples llamadas
// a requireAuth/requireAdmin reutilizan la misma promesa → sin doble lectura.
// ────────────────────────────────────────────────
let sessionPromise = null;

/**
 * Resuelve la sesión actual del usuario.
 * @returns {Promise<{user: Object|null, profile: Object|null, error?: Error}>}
 */
async function resolveSession() {
    if (sessionPromise) return sessionPromise;

    sessionPromise = (async () => {
        // Esperar a que Firebase Auth determine el estado inicial.
        // authStateReady() evita la race condition donde onAuthStateChanged
        // dispara primero con `null` antes de tener el usuario real.
        if (typeof auth.authStateReady === "function") {
            await auth.authStateReady();
        } else {
            // Fallback para SDKs antiguos
            await new Promise(resolve => {
                const unsub = onAuthStateChanged(auth, () => {
                    unsub();
                    resolve();
                });
            });
        }

        const user = auth.currentUser;

        if (!user) {
            return { user: null, profile: null };
        }

        // Leer el perfil de Firestore
        try {
            const snap = await getDoc(doc(db, "users", user.uid));

            if (!snap.exists()) {
                console.warn("[auth.guard] Usuario sin doc en /users:", user.uid);
                return { user, profile: null };
            }

            return { user, profile: snap.data() };

        } catch (err) {
            console.error("[auth.guard] Error obteniendo perfil:", err);
            return { user, profile: null, error: err };
        }
    })();

    return sessionPromise;
}

// ────────────────────────────────────────────────
// REDIRECTS
// ────────────────────────────────────────────────
function goToLogin(reason) {
    if (reason) {
        // Guardamos el motivo para que login.html lo muestre (opcional)
        try { sessionStorage.setItem("auth.redirectReason", reason); } catch (_) {}
    }
    // replace() para no dejar la ruta protegida en el historial
    window.location.replace("login.html");
}

function goToHome() {
    window.location.replace("index.html");
}

// ────────────────────────────────────────────────
// GUARDS PÚBLICOS
// ────────────────────────────────────────────────

/**
 * Requiere que haya una sesión activa.
 * - Sin sesión → redirige a login.html
 * - Sin doc en /users → cierra sesión y redirige a login.html
 * - Con `enabled: false` → cierra sesión y redirige a login.html
 *
 * @returns {Promise<{user: Object, profile: Object}|null>}
 */
export async function requireAuth() {
    const { user, profile } = await resolveSession();

    // 1. Sin sesión
    if (!user) {
        goToLogin("no-session");
        return null;
    }

    // 2. Sin doc en /users
    if (!profile) {
        try { await signOut(auth); } catch (_) {}
        goToLogin("no-profile");
        return null;
    }

    // 3. Usuario inhabilitado
    if (profile.enabled === false) {
        try { await signOut(auth); } catch (_) {}
        goToLogin("disabled");
        return null;
    }

    // ✅ OK
    return { user, profile };
}

/**
 * Requiere que el usuario tenga rol "admin".
 * Además de lo que valida requireAuth(), verifica:
 * - profile.role === "admin"
 * Si no es admin → redirige a index.html (sin desloguear).
 *
 * @returns {Promise<{user: Object, profile: Object}|null>}
 */
export async function requireAdmin() {
    const session = await requireAuth();

    // requireAuth ya redirigió si hacía falta
    if (!session) return null;

    // Rol distinto de admin → fuera, pero sin desloguear
    if (session.profile.role !== "admin") {
        goToHome();
        return null;
    }

    // ✅ OK
    return session;
}

// ────────────────────────────────────────────────
// HELPERS SÍNCRONOS (usan la caché)
// ────────────────────────────────────────────────

/**
 * Espera a que la sesión esté resuelta y devuelve el user de Firebase Auth.
 * No redirige a ningún sitio. Útil para páginas públicas o para
 * componer guards propios.
 */
export async function waitForAuth() {
    return resolveSession();
}

/**
 * Devuelve el usuario actual o null.
 * NOTA: requiere que `resolveSession()` ya haya terminado.
 * Si lo llamas inmediatamente después de import, probablemente sea null.
 * En su lugar usa `waitForAuth()` o `requireAuth()`.
 */
export function getCurrentUser() {
    return auth.currentUser || null;
}

/**
 * Devuelve el perfil cacheado del usuario (de Firestore).
 * Si no se ha resuelto la sesión todavía, devuelve null.
 * Para asegurar que esté resuelto, espera primero:
 *
 *   await waitForAuth();
 *   const profile = getCurrentProfile();
 */
let cachedProfile = null;
let cachedProfileResolved = false;

// Hook automático: cuando resolveSession termine, guardamos el perfil
resolveSession().then(({ profile }) => {
    cachedProfile = profile;
    cachedProfileResolved = true;
});

export function getCurrentProfile() {
    return cachedProfile;
}

export function isProfileResolved() {
    return cachedProfileResolved;
}

/**
 * Devuelve el rol actual o null si no se ha resuelto.
 */
export function getCurrentRole() {
    return cachedProfile?.role || null;
}

/**
 * ¿Es admin? (seguro, verifica enabled)
 */
export function currentUserIsAdmin() {
    return cachedProfile?.role === "admin" && cachedProfile?.enabled !== false;
}

/**
 * ¿Es viewer? (seguro, verifica enabled)
 */
export function currentUserIsViewer() {
    return cachedProfile?.role === "viewer" && cachedProfile?.enabled !== false;
}

/**
 * Cierra sesión y redirige al login.
 */
export async function logout() {
    try {
        await signOut(auth);
    } catch (err) {
        console.error("[auth.guard] Error al cerrar sesión:", err);
    }
    goToLogin();
}