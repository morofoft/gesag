import os

# CONFIGURACIÓN:
# Carpeta raíz de tu proyecto (por defecto usa la carpeta actual donde ejecutes el script)
DIRECTORIO_PROYECTO = "."

# Nombre del archivo de salida donde se guardará todo el código unido
ARCHIVO_SALIDA = "codigo_consolidado_proyecto.txt"

# Extensiones de archivos que deseas incluir (puedes agregar o quitar según necesites)
EXTENSIONES_PERMITIDAS = {".html", ".css", ".js", ".py", ".json", ".xml", ".php"}

# Carpetas o nombres de archivo que deseas ignorar (para evitar basura o archivos pesados)
CARPETAS_IGNORADAS = {
    "node_modules",
    ".git",
    "venv",
    "env",
    "__pycache__",
    "dist",
    "build",
}
ARCHIVOS_IGNORADOS = {ARCHIVO_SALIDA, "unir_codigo.py", "utilidades.txt"}


def unir_codigo():
  print(f"Iniciando consolidación de código desde: {os.path.abspath(DIRECTORIO_PROYECTO)}")
  
  total_archivos = 0

  with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as salida:
    # Recorremos el directorio de manera recursiva
    for raiz, directorios, archivos in os.walk(DIRECTORIO_PROYECTO):
      # Modificamos 'directorios' in-place para evitar que os.walk entre en carpetas ignoradas
      directorios[:] = [d for d in directorios if d not in CARPETAS_IGNORADAS]

      for archivo in archivos:
        if archivo in ARCHIVOS_IGNORADOS:
          continue

        # Verificamos la extensión del archivo
        _, extension = os.path.splitext(archivo)
        if extension.lower() in EXTENSIONES_PERMITIDAS:
          ruta_completa = os.path.join(raiz, archivo)
          ruta_relativa = os.path.relpath(ruta_completa, DIRECTORIO_PROYECTO)

          print(f"Agregando: {ruta_relativa}")

          # Escribimos un encabezado claro para cada archivo
          salida.write(f"\n{'='*80}\n")
          salida.write(f"ARCHIVO: {ruta_relativa}\n")
          salida.write(f"{'='*80}\n\n")

          try:
            with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
              salida.write(f.read())
            salida.write("\n\n")
            total_archivos += 1
          except Exception as e:
            salida.write(f"[Error al leer este archivo: {e}]\n\n")

  print(f"\n¡Proceso completado con éxito!")
  print(f"Se unieron {total_archivos} archivos en: {os.path.abspath(ARCHIVO_SALIDA)}")


if __name__ == "__main__":
  unir_codigo()