import os
import re
import sys

# Patrones Peligrosos a Detectar
VULNERABILITIES = [
    {
        "id": "SQLi_01",
        "name": "Posible InyecciÃ³n SQL Directa (InterpolaciÃ³n)",
        "regex": re.compile(r'SELECT.*FROM.*WHERE.*\$.*?=\s*[\'"]?\$[\w_]+[\'"]?'),
        "severity": "CRITICAL"
    },
    {
        "id": "SQLi_02",
        "name": "Uso de $_POST o $_GET directo en consulta SQL",
        "regex": re.compile(r'query\(.*?\$_(POST|GET)\[.*?\]'),
        "severity": "CRITICAL"
    },
    {
        "id": "CORS_01",
        "name": "CORS Expuesto Peligrosamente",
        "regex": re.compile(r'header\(.*?Access-Control-Allow-Origin.*?(\*|.*?).*\)'),
        "severity": "WARNING"
    }
]

def scan_file(filepath):
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                # Skip comments quickly
                if line.strip().startswith('//') or line.strip().startswith('*'):
                    continue
                
                for vuln in VULNERABILITIES:
                    if vuln["regex"].search(line):
                        issues.append({
                            "line": i + 1,
                            "type": vuln["name"],
                            "severity": vuln["severity"]
                        })
    except Exception as e:
        print(f"[ERROR] No se pudo leer {filepath}: {e}")
    return issues

def scan_directory(directory):
    total_files = 0
    total_issues = 0
    print("========================================")
    print("[SECURITY GUARD] PHP SECURITY GUARD (Static Analyzer)")
    print("========================================\n")
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.php'):
                total_files += 1
                filepath = os.path.join(root, file)
                issues = scan_file(filepath)
                
                if issues:
                    print(f"[FILE] {filepath}")
                    for issue in issues:
                        total_issues += 1
                        sev_color = "[CRITICAL]" if issue["severity"] == "CRITICAL" else "[WARN]"
                        print(f"   --> {sev_color} L{issue['line']}: {issue['type']}")
    
    print("\n----------------------------------------")
    print(f"Archivos Escaneados: {total_files}")
    print(f"Vulnerabilidades Encontradas: {total_issues}")
    if total_issues == 0:
        print("[SUCCESS] CÃ³digo backend cumple con los mÃ­nimos de seguridad.")
    else:
        print("[ALERTA] Se recomienda revisar y usar PDO Prepared Statements.")

if __name__ == "__main__":
    target_dir = "../../api" # Default to api folder
    if len(sys.argv) > 1:
        target_dir = sys.argv[1]
    
    if not os.path.exists(target_dir):
        print(f"[ERROR] Directorio no encontrado: {target_dir}")
    else:
        scan_directory(target_dir)
