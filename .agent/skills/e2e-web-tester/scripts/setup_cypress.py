import os

def setup_e2e():
    print("========================================")
    print("[E2E] END-TO-END BROWSER TESTER (CYPRESS)")
    print("========================================\n")
    
    # Cypress config file at React root
    cypress_config = """const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: false,
    screenshotOnRunFailure: true,
  },
});
"""

    # Basic sample test
    sample_test = """describe('Autenticacion Critica', () => {
  it('Debe cargar la pagina de login', () => {
    cy.visit('/login')
    cy.get('h2').should('contain', 'Iniciar') // Verifica que exista el encabezado de Login
  })

  it('Debe mostrar alerta de fallo con credenciales incorrectas', () => {
    cy.visit('/login')
    cy.get('input[type="text"]').type('usuario_fantasma')
    cy.get('input[type="password"]').type('123456')
    cy.get('button[type="submit"]').click()
    
    // Asumiendo que sale una animacion o texto de error
    cy.contains('error', { matchCase: false }).should('exist')
  })
})
"""

    client_dir = "client"
    if not os.path.exists(client_dir):
        print("[ERROR] Directorio client/ no encontrado.")
        return

    # Escribir Cypress Config
    conf_path = os.path.join(client_dir, "cypress.config.js")
    with open(conf_path, 'w', encoding='utf-8') as f:
        f.write(cypress_config)
        
    # Crear estructura e2e
    e2e_dir = os.path.join(client_dir, "cypress", "e2e")
    os.makedirs(e2e_dir, exist_ok=True)
    
    test_path = os.path.join(e2e_dir, "login_critical.cy.js")
    with open(test_path, 'w', encoding='utf-8') as f:
        f.write(sample_test)
        
    print(f"[OK] Infraestructura de Tests Automáticos E2E generada.")
    print(f"[OK] Test crítico de Login creado en: {test_path}\n")

    print("----------------------------------------")
    print("INSTRUCCIONES FINALES:")
    print("1. Instala el Robot probador (tomara unc par de minutos):")
    print("   cd client && npm install cypress --save-dev")
    print("2. Abre el probador visual automático:")
    print("   npx cypress open")
    print("----------------------------------------")
    print("A partir de ahora, tienes un empleado Robot (Cypress) que hara los clics por ti.")

if __name__ == "__main__":
    setup_e2e()
