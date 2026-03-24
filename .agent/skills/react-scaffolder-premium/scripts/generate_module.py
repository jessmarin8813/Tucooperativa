import sys
import os

def create_stub(module_name):
    # Definir rutas
    view_path = f"client/src/views/{module_name}.jsx"
    comp_dir = f"client/src/components/{module_name.lower()}"
    table_path = f"{comp_dir}/{module_name}Table.jsx"
    const_path = f"{comp_dir}/{module_name}Constants.js"

    # Crear directorio si no existe
    os.makedirs(comp_dir, exist_ok=True)

    # 1. Contenido de la Vista
    view_content = f"""import React from 'react';
import {{ formatMoney }} from '../components/dashboard/DashboardConstants';
import {module_name}Table from '../components/{module_name.lower()}/{module_name}Table';

const {module_name} = () => {{
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-2 md:p-8 animate-in fade-in duration-500">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 dark:border-gray-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">ðŸš€ MÃ³dulo {module_name}</h1>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-2 uppercase tracking-wide">
                    Generado automÃ¡ticamente por Antigravity Scaffolder.
                </p>
            </div>
            
            <{module_name}Table formatCurrency={{formatMoney}} />
        </div>
    );
}};

export default {module_name};
"""

    # 2. Contenido de la Tabla
    table_content = f"""import React from 'react';

const {module_name}Table = ({{ formatCurrency }}) => {{
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Tabla de {module_name} (Pronto)</p>
        </div>
    );
}};

export default {module_name}Table;
"""

    # 3. Contenido de Constantes
    const_content = f"""// {module_name}Constants.js
export const {module_name.upper()}_TYPES = [
    {{ id: '1', label: 'TIPO_A' }},
];
"""

    # Escribir archivos
    with open(view_path, 'w', encoding='utf-8') as f:
        f.write(view_content)
    with open(table_path, 'w', encoding='utf-8') as f:
        f.write(table_content)
    with open(const_path, 'w', encoding='utf-8') as f:
        f.write(const_content)

    print(f"[SUCCESS] MÃ³dulo {module_name} generado correctamente en client/src/")
    print(f"   - {view_path}")
    print(f"   - {table_path}")
    print(f"   - {const_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python generate_module.py <NombreModulo>")
    else:
        create_stub(sys.argv[1])
