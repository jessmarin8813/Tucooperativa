import sys
import re
import os

def minify_code(filepath):
    """Extract key structural elements from JS/JSX files."""
    if not os.path.exists(filepath):
        print(f"Error: File {filepath} not found.")
        return

    summary = []
    summary.append(f"### SUMMARY OF: {os.path.basename(filepath)}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
            imports = []
            states = []
            effects = []
            exports = []
            main_component = ""
            
            for line in lines:
                line = line.strip()
                # Imports
                if line.startswith('import '):
                    imports.append(line)
                # State
                if 'useState(' in line:
                    states.append(line)
                # Effects
                if 'useEffect(' in line:
                    effects.append("useEffect hook present")
                # Main Component
                match_comp = re.search(r'const (\w+) = \(\{.+\}\) =>', line)
                if match_comp:
                    main_component = match_comp.group(1)
                
                # Exports
                if line.startswith('export default '):
                    exports.append(line)

            summary.append(f"- **Component**: {main_component if main_component else 'Unknown'}")
            summary.append(f"- **Key Imports**: {len(imports)} lines")
            summary.append("- **Main State**: ")
            for s in states[:5]: summary.append(f"  - `{s}`")
            if len(states) > 5: summary.append(f"  - ... and {len(states)-5} more")
            
            summary.append(f"- **Hooks**: {len(effects)} useEffects")
            summary.append(f"- **Exports**: {', '.join(exports)}")

    except Exception as e:
        summary.append(f"Error reading file: {e}")

    print("\n".join(summary))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python minify_context.py <filepath>")
    else:
        minify_code(sys.argv[1])
