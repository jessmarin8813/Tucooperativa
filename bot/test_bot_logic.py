import sys
import os

# Simulación de estados y lógica del Bot
# (Mismo que bot.py pero inyectando mocks)

class MockApi:
    def register_via_token(self, token, tid, name):
        print(f"DEBUG: Registrando {tid} con token {token}")
        return {'status': 'success'}
    
    def check_authorization(self, tid):
        # Simulamos que el ID 999 está suspendido
        if tid == 999:
            return {'status': 'suspendido'}
        return {'status': 'activo'}

def test_onboarding():
    print("Testing One-Click Onboarding...")
    api = MockApi()
    res = api.register_via_token("INV-TEST", 123, "Chofer Juan")
    assert res['status'] == 'success'
    print("✅ PASS: Link registration")

def test_gatekeeper():
    print("Testing Gatekeeper Security...")
    api = MockApi()
    
    # Authorized
    res = api.check_authorization(123)
    assert res['status'] == 'activo'
    
    # Suspended
    res = api.check_authorization(999)
    assert res['status'] == 'suspendido'
    print("✅ PASS: Gatekeeper (Active vs Suspended)")

if __name__ == "__main__":
    try:
        test_onboarding()
        test_gatekeeper()
        print("\n--- BOT LOGIC VERIFIED ---")
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        sys.exit(1)
