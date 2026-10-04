import os

# Extensiones de código a incluir
EXTENSIONES_PERMITIDAS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.kt', '.java', 
    '.html', '.css', '.json', '.sql', '.xml', '.yaml', '.yml'
}

# Carpetas que se deben ignorar por completo
CARPETAS_IGNORADAS = {
    '.git', '.idea', '.vscode', 'node_modules', 'venv', 
    '__pycache__', 'build', 'dist', 'bin', 'obj','unir.py', 'corregidos.txt'
}

# Archivos específicos que se deben ignorar
ARCHIVOS_IGNORADOS = {
    'package-lock.json', 'yarn.lock', 'concatenar_codigo.py', 'codigo_completo.txt'
}

# Nombre del archivo donde se guardará todo
ARCHIVO_SALIDA = "codigo_completo.txt"


def concatenar_proyecto(directorio_raiz, archivo_salida):
    archivos_procesados = 0
    
    with open(archivo_salida, 'w', encoding='utf-8') as salida:
        salida.write(f"=== RESUMEN DEL PROYECTO ===\n")
        salida.write(f"Ruta base: {os.path.abspath(directorio_raiz)}\n\n")

        for raiz, directorios, archivos in os.walk(directorio_raiz):
            # Filtrar carpetas ignoradas en sitio para evitar recorrerlas
            directorios[:] = [d for d in directorios if d not in CARPETAS_IGNORADAS]

            for archivo in archivos:
                if archivo in ARCHIVOS_IGNORADOS:
                    continue

                _, ext = os.path.splitext(archivo)
                if ext.lower() in EXTENSIONES_PERMITIDAS:
                    ruta_completa = os.path.join(raiz, archivo)
                    ruta_relativa = os.path.relpath(ruta_completa, directorio_raiz)

                    salida.write("=" * 80 + "\n")
                    salida.write(f"ARCHIVO: {ruta_relativa}\n")
                    salida.write("=" * 80 + "\n\n")

                    try:
                        with open(ruta_completa, 'r', encoding='utf-8') as f:
                            salida.write(f.read())
                    except UnicodeDecodeError:
                        # Intentar con codificación fallback en caso de caracteres especiales
                        try:
                            with open(ruta_completa, 'r', encoding='latin-1') as f:
                                salida.write(f.read())
                        except Exception as e:
                            salida.write(f"[ERROR AL LEER ARCHIVO: {e}]\n")
                    except Exception as e:
                        salida.write(f"[ERROR AL LEER ARCHIVO: {e}]\n")

                    salida.write("\n\n")
                    archivos_procesados += 1

    print(f"✅ Proceso completado. Se unieron {archivos_procesados} archivos en '{archivo_salida}'.")


if __name__ == "__main__":
    # Ejecuta el script tomando como base la carpeta actual donde se ejecuta
    directorio_actual = os.getcwd()
    concatenar_proyecto(directorio_actual, ARCHIVO_SALIDA)