/**
 * ────────────────────────────────────────────────────────────────
 * firebase.init.js
 * Inicialización centralizada de Firebase (App, Auth, Firestore).
 *
 * ⚠️ IMPORTANTE: Este archivo debe ser el ÚNICO punto donde se
 * inicializa Firebase. Ninguna página (configuracion.html,
 * reportes.html, users.html, etc.) debe llamar a initializeApp()
 * ni a getFirestore() por su cuenta. Todas deben importar desde aquí.
 *
 * SDK Version: 10.12.2
 * ────────────────────────────────────────────────────────────────
 */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL PROYECTO
// ────────────────────────────────────────────────────────────────
// Nota: la apiKey de Firebase para apps web NO es un secreto. Está
// diseñada para ser pública. La seguridad real la dan:
//   1. Las Reglas de Firestore
//   2. Firebase App Check (recomendado activar)
// ────────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyA9wJ-vgcwG-MJ6gqQz3byolJP6DwrjnVw",
    authDomain: "agencias-v2.firebaseapp.com",
    projectId: "agencias-v2",
    storageBucket: "agencias-v2.firebasestorage.app",
    messagingSenderId: "896099760213",
    appId: "1:896099760213:web:969ffa8363d51c0a8bbcdc"
};

// ────────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ────────────────────────────────────────────────────────────────
// Reutiliza la app si ya existe. Evita el error
// "Firebase App named '[DEFAULT]' already exists".
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

// ────────────────────────────────────────────────────────────────
// APP SECUNDARIA
// ────────────────────────────────────────────────────────────────
// Se usa EXCLUSIVAMENTE para crear usuarios nuevos desde users.html
// sin desloguear al admin activo. Auth no permite crear usuarios
// en la misma app sin cerrar la sesión actual.
// ────────────────────────────────────────────────────────────────
const SECONDARY_APP_NAME = "SecondaryApp";
const secondaryApp = getApps().some(a => a.name === SECONDARY_APP_NAME)
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(firebaseConfig, SECONDARY_APP_NAME);

// ────────────────────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────────────────────
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);

// ────────────────────────────────────────────────────────────────
// FIRESTORE
// ────────────────────────────────────────────────────────────────
// Se usa initializeFirestore (en lugar de getFirestore) para poder
// configurar:
//   1. ignoreUndefinedProperties → evita error cuando un campo es
//      undefined (ej: agencia sin dirección o sin coordenadas).
//   2. localCache persistente → la app funciona offline y las
//      lecturas repetidas se sirven desde IndexedDB (menos costo).
//
// Si ya fue inicializado previamente (hot-reload, doble import, etc.),
// caemos a getFirestore() sin configuración adicional.
// ────────────────────────────────────────────────────────────────
let dbInstance;

try {
    dbInstance = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
            // Permite múltiples pestañas abiertas sin conflictos
            tabManager: persistentMultipleTabManager()
        })
    });
} catch (err) {
    console.warn(
        "[firebase.init] initializeFirestore() falló, usando getFirestore():",
        err.message
    );
    dbInstance = getFirestore(app);
}

export const db = dbInstance;

// ────────────────────────────────────────────────────────────────
// UTILIDADES EXPORTADAS
// ────────────────────────────────────────────────────────────────

/**
 * Cierra la sesión de la app secundaria.
 * Útil después de crear un usuario desde users.html para dejar
 * limpia la instancia secundaria.
 * NO afecta la sesión del admin en la app principal.
 *
 * @returns {Promise<void>}
 */
export async function clearSecondaryAuth() {
    try {
        if (secondaryAuth.currentUser) {
            await secondaryAuth.signOut();
        }
    } catch (err) {
        console.warn("[firebase.init] Error limpiando auth secundaria:", err);
    }
}

// ────────────────────────────────────────────────────────────────
// LOG DE DIAGNÓSTICO (solo en desarrollo)
// ────────────────────────────────────────────────────────────────
const isLocalhost = ["localhost", "127.0.0.1", ""].includes(location.hostname);

if (isLocalhost) {
    console.log("🔥 Firebase inicializado correctamente:", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        apps: getApps().map(a => a.name),
        sdkVersion: "10.12.2"
    });
}