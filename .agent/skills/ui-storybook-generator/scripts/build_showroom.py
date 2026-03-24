import os

JSX_TEMPLATE = '''import React, { Component } from 'react';
/* INYECTA TUS COMPONENTES PREMIUM AQUI */
{imports}

// Error Boundary para evitar que paneles complejos (que requieran props/APIs) tumben todo el Showroom
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <span className="text-red-400 text-xs italic opacity-75">Visualizacion bloqueada (Requiere Contexto/Props)</span>;
    }
    return <div className="w-full flex justify-center pointer-events-none">{this.props.children}</div>;
  }
}

const Showroom = () => {
  return (
    <div className="p-8 bg-base min-h-screen text-primary transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tighter">
            Sistema de Diseño (Showroom)
          </h1>
          <p className="text-secondary font-medium">Catálogo Auto-Generado de Componentes Premium (Protegido por ErrorBoundary).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{components}
        </div>
      </div>
    </div>
  );
};

export default Showroom;
'''

def generate_showroom(src_dir="client/src/components", dest_file="client/src/views/Showroom.jsx"):
    imports = []
    components_jsx = []

    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js')) and file not in ['index.js', 'ProtectedRoute.jsx', 'Layout.jsx']:
                if "Constants" in file or "Config" in file or "Context" in file: continue
                comp_name = file.replace('.jsx', '').replace('.js', '')
                rel_path = os.path.relpath(os.path.join(root, file), os.path.dirname(dest_file)).replace('\\', '/')
                imports.append(f"import {comp_name} from '{rel_path}';")
                
                # Diseño de tarjeta para cada componente
                components_jsx.append(f'''
          {{/* COMPONENTE: {comp_name} */}}
          <div className="bg-surface border border-default rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <p className="absolute top-2 left-3 text-[10px] uppercase font-black tracking-widest text-muted opacity-50">&lt;{comp_name} /&gt;</p>
             <div className="mt-6 w-full flex items-center justify-center p-4">
                <ErrorBoundary>
                    <{comp_name} />
                </ErrorBoundary>
             </div>
          </div>
''')

    print(f"[+] Detectados {len(components_jsx)} componentes de UI reutilizables.")
    
    final_code = JSX_TEMPLATE.replace('{imports}', chr(10).join(imports))
    final_code = final_code.replace('{components}', ''.join(components_jsx))

    os.makedirs(os.path.dirname(dest_file), exist_ok=True)
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(final_code)

if __name__ == "__main__":
    generate_showroom()
