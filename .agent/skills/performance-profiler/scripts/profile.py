import os

def run_profiler():
    print("========================================")
    print("[PROFILER] PERFORMANCE PROFILER (Vite/React)")
    print("========================================\n")
    
    dist_dir = "client/dist/assets"
    
    if not os.path.exists(dist_dir):
        print(f"[ERROR] No existe la carpeta {dist_dir}. Debes correr npm build primero.")
        return

    print("[+] Analizando Bundle Compilado...\n")
    
    total_js = 0
    total_css = 0
    largest_file = {"name": "", "size": 0}
    
    for file in os.listdir(dist_dir):
        filepath = os.path.join(dist_dir, file)
        size_kb = os.path.getsize(filepath) / 1024
        
        if file.endswith('.js'):
            total_js += size_kb
        elif file.endswith('.css'):
            total_css += size_kb
            
        if size_kb > largest_file["size"]:
            largest_file = {"name": file, "size": size_kb}
            
        print(f"  - {file}: {size_kb:.2f} KB")

    print("\n----------------------------------------")
    print(f"[JS] Total JavaScript: {total_js:.2f} KB")
    print(f"[CSS] Total CSS: {total_css:.2f} KB")
    print(f"[BIG] Archivo mas pesado: {largest_file['name']} ({largest_file['size']:.2f} KB)")
    
    print("\n[DIAGNOSTICO]:")
    if largest_file["size"] > 500:
        print(" [ALERTA] Tienes un archivo JS individual de mas de 500KB.")
        print("          Recomendacion: Implementar React.lazy() en tus Rutas.")
    else:
        print(" [SUCCESS] Tu bundle esta super optimizado y ligero.")

if __name__ == "__main__":
    run_profiler()
