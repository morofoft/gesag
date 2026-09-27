import { db, auth } from "./firebase/firebase.init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Protección general (Estar logueado)
export function requireAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}

// Protección estricta para Admin
export function requireAdmin() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {
            const userDocSnap = await getDoc(doc(db, "users", user.uid));
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();

                // Validar si es admin (por rol o username)
                const isAdmin = userData.role === "administrador" || userData.username === "admin";

                if (!isAdmin) {
                    alert("Acceso denegado. Se requieren permisos de Administrador.");
                    window.location.href = "index.html";
                }
            } else {
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Error verificando rol:", error);
            window.location.href = "index.html";
        }
    });
}