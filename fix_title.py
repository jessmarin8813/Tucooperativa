import os

path = r'c:\xampp\htdocs\TuCooperativa\client\dist\index.html'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try multiple variations of the title tag to match
    new_content = content.replace('<title>TuCooperativa | Control Inteligente</title>', '<title>TuCooperativa | v11.6 ACTIVE</title>')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.read = f.write(new_content)
    print("SUCCESS: Title updated to v11.6 ACTIVE")
else:
    print("ERROR: File not found")
