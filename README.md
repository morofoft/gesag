# 🏢 GesagPro - Sistema de Gestión y Optimización de Agencias

![Version](https://img.shields.io/badge/version-3.2.1-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.12.2-orange.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-CDN-38B2AC.svg)
![License](https://img.shields.io/badge/license-Privado-red.svg)

**GesagPro** es una plataforma web integral (Single Page Application) para la gestión, geolocalización, optimización de rutas y análisis de agencias/sucursales. Desarrollado con un enfoque *Mobile-First*, cuenta con un sistema robusto de roles y permisos, soporte offline y herramientas avanzadas de exportación e impresión.

---

## 🚀 Características Principales

- **Dashboard Central (index.html):** Panel de control con KPIs en tiempo real, búsqueda predictiva y gestión (CRUD) de agencias.
- **Mapa Interactivo (mapa.html):** Visualización geoespacial con Leaflet, filtros por zonas y apertura de rutas de navegación (Google Maps / Waze).
- **Optimizador de Rutas (rutas.html):** Cálculo de rutas en tiempo real consumiendo la API de OSRM, utilizando algoritmos de optimización (Nearest Neighbor + 2-opt) para trazar el camino más corto.
- **Agencias Cercanas (cercana.html):** Rastreo GPS en vivo y cálculo de distancias usando la fórmula de Haversine.
- **Generador de Impresión (imprimir.html):** Módulo altamente personalizable. Permite seleccionar columnas dinámicas, ajustar el tamaño de fuente, altura de filas y guardar configuraciones en `localStorage`. Incluye "Auto-Fit Text" para evitar desbordamiento.
- **Reportes y Analítica (reportes.html):** Gráficos dinámicos con Chart.js, exportación a Excel (SheetJS) y generación de reportes imprimibles.
- **Gestión de Usuarios (users.html):** Creación de cuentas usando una instancia secundaria de Firebase (para no cerrar la sesión del admin actual), asignación de roles y módulos permitidos.
- **Gestión de Zonas (zonas.html):** Panel administrativo para renombrar, fusionar y eliminar zonas, actualizando las agencias vinculadas en lote.
- **Buzón de Sugerencias (sugerencias.html):** Sistema de feedback en tiempo real con flujo de aprobación/rechazo para administradores.
- **Importación Masiva (configuracion.html):** Carga de datos mediante archivos Excel o copiar/pegar, con validación y prevención de duplicados.

---

## 🛠️ Stack Tecnológico

**Frontend:**
- HTML5 / CSS3 / Vanilla JavaScript (ES Modules)
- [Tailwind CSS](https://tailwindcss.com/) (vía CDN para estilos ágiles)
- [Font Awesome](https://fontawesome.com/) (Iconografía)
- [SweetAlert2](https://sweetalert2.github.io/) (Modales y alertas UI)
- [Chart.js](https://www.chartjs.org/) (Gráficos y analíticas)
- [Leaflet.js](https://leafletjs.com/) (Mapas interactivos)
- [Toastify JS](https://apvarun.github.io/toastify-js/) (Notificaciones flotantes)
- [SheetJS (xlsx)](https://sheetjs.com/) (Procesamiento de Excel)

**Backend & Servicios:**
- [Firebase](https://firebase.google.com/) (v10.12.2)
  - **Auth:** Autenticación de usuarios.
  - **Firestore:** Base de datos NoSQL en tiempo real (con persistencia local habilitada para soporte offline).
- [OSRM (Open Source Routing Machine)](http://project-osrm.org/) (Cálculo de rutas y matrices de distancia reales).

---

## 📂 Estructura del Proyecto

```text
/
├── index.html              # Dashboard principal y lista de agencias
├── mapa.html               # Mapa interactivo (Leaflet)
├── rutas.html              # Optimizador de rutas y rastreo GPS
├── cercana.html            # Búsqueda por proximidad GPS
├── reportes.html           # Analítica, gráficos y exportación
├── imprimir.html           # Generador de PDFs/Impresión personalizable
├── configuracion.html      # Importación masiva (Excel/Texto)
├── zonas.html              # Administración de zonas
├── users.html              # Gestión de usuarios y permisos
├── sugerencias.html        # Buzón de sugerencias
├── acerca.html             # Créditos del sistema
├── login.html              # Autenticación
│
├── js/
│   ├── firebase/
│   │   └── firebase.init.js # Inicialización centralizada de Firebase (App principal y secundaria)
│   ├── auth.guard.js       # Protección de rutas, caché de sesión y validación de roles/módulos
│   └── sidebar.js          # Inyección dinámica del menú lateral según permisos
│
└── img/
    └── favicon.svg         # Logotipo e ícono de la aplicación