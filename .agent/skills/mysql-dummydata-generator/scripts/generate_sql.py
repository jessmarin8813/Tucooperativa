import random
import datetime

def generate_sql():
    print("========================================")
    print("[DATA GEN] MYSQL DUMMY DATA GENERATOR")
    print("========================================\n")
    
    with open("stress_test.sql", "w", encoding='utf-8') as f:
        f.write("-- ARCHIVO GENERADO AUTOMATICAMENTE PARA PRUEBAS DE ESTRÃ‰S\n")
        f.write("SET FOREIGN_KEY_CHECKS=0;\n\n")
        
        # 1. GENERAR CONTRATOS FALSOS
        print("[+] Generando 200 Contratos Falsos...")
        empresas = [1, 2, 3] # IDs comunes
        for i in range(1, 201):
            empresa = random.choice(empresas)
            numero_contrato = f"C-STRESS-{random.randint(1000,9999)}-{i}"
            monto = random.randint(1500, 150000)
            fecha_inicio = f"2026-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            
            sql = f"INSERT IGNORE INTO contratos (id, empresa_id, numero_contrato, descripcion, monto_total, moneda, fecha_inicio, estado) VALUES "
            sql += f"({10000 + i}, {empresa}, '{numero_contrato}', 'Contrato de Prueba {i}', {monto}, 'USD', '{fecha_inicio}', 'activo');\n"
            f.write(sql)
        
        # 2. GENERAR VALUACIONES FALSAS
        print("[+] Generando 500 Valuaciones Falsas...")
        for i in range(1, 501):
            contrato_id = random.randint(10001, 10200)
            monto_bruto = random.randint(500, 5000)
            fecha_corte = f"2026-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            estado = random.choice(['aprobada', 'borrador', 'enviada'])
            
            sql = f"INSERT IGNORE INTO valuaciones (id, contrato_id, numero_valuacion, fecha_corte, monto_bruto, estado) VALUES "
            sql += f"({20000 + i}, {contrato_id}, {random.randint(1,10)}, '{fecha_corte}', {monto_bruto}, '{estado}');\n"
            f.write(sql)
            
        f.write("\nSET FOREIGN_KEY_CHECKS=1;\n")
        
    print("\n[OK] Archivo `stress_test.sql` generado con Ã©xito.")
    print("Importa este archivo en XAMPP para poblar tu sistema.\n")

if __name__ == "__main__":
    generate_sql()
