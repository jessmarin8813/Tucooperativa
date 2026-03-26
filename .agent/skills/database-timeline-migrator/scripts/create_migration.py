import sys
import os
import datetime

def create_migration(name):
    print("========================================")
    print("[MIGRATOR] DATABASE TIMELINE MIGRATOR")
    print("========================================\n")
    
    timestamp = datetime.datetime.now().strftime("%Y_%m_%d_%H%M%S")
    clean_name = name.lower().replace(" ", "_")
    filename = f"{timestamp}_{clean_name}.sql"
    
    migrations_dir = "database/migrations"
    os.makedirs(migrations_dir, exist_ok=True)
    
    filepath = os.path.join(migrations_dir, filename)
    
    template = f"""-- MIGRATION: {name}
-- GENERATED: {timestamp}

-- UP MIGRATION
/* ALTER TABLE mi_tabla ADD COLUMN nueva_columna VARCHAR(50) NULL; */

-- DOWN MIGRATION (Rollback)
/* ALTER TABLE mi_tabla DROP COLUMN nueva_columna; */
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template)
        
    print(f"[OK] Archivo de migracion estructurado generado.")
    print(f"     => {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("[ERROR] Uso: python create_migration.py <nombre>")
    else:
        create_migration(sys.argv[1])
