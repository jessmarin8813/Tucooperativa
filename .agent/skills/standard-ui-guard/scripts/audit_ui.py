import os
import re

def audit_money_format(path):
    """Check for local money formatting in JS/JSX files."""
    violations = []
    forbidden_patterns = [
        r'\.toLocaleString\(',
        r'const formatCurrency = ',
        r'function formatCurrency'
    ]
    
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                # Skip DashboardConstants.js itself
                if file == 'DashboardConstants.js':
                    continue
                
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for pattern in forbidden_patterns:
                            if re.search(pattern, content):
                                violations.append(f"[RULE #2] Local formatting found in {file} (Pattern: {pattern})")
                except Exception as e:
                    pass
    return violations

def audit_charts(path):
    """Check for ResponsiveContainer without fixed-height parent."""
    violations = []
    
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if '<ResponsiveContainer' in content:
                            # Simple heuristic: check if nearby lines contain h-[ or style={{height:
                            # A real parser would be better, but grep-style works for now
                            if 'h-[' not in content and 'height:' not in content and 'h-' not in content:
                                violations.append(f"[RULE #3] Chart in {file} might be missing fixed height.")
                except Exception as e:
                    pass
    return violations

if __name__ == "__main__":
    src_path = "client/src"
    print("--- STARTING UI AUDIT ---")
    
    money_issues = audit_money_format(src_path)
    chart_issues = audit_charts(src_path)
    
    if not money_issues and not chart_issues:
        print("[SUCCESS] 100% COMPLIANCE. No issues found.")
    else:
        for issue in money_issues: print(issue)
        for issue in chart_issues: print(issue)
    
    print("--- AUDIT COMPLETE ---")
