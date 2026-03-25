import requests
import os
from dotenv import load_dotenv

load_dotenv()

class TuCooperativaAPI:
    def __init__(self):
        self.base_url = os.getenv('BACKEND_URL')
        self.session = requests.Session()

    def login(self, email, password):
        try:
            response = self.session.post(f"{self.base_url}/login.php", json={
                'email': email,
                'password': password
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def start_route(self, vehiculo_id, odometro, foto='', monto_efectivo=0, monto_pagomovil=0):
        try:
            response = self.session.post(f"{self.base_url}/rutas.php", json={
                'action': 'start_route',
                'vehiculo_id': vehiculo_id,
                'odometro_valor': odometro,
                'foto_path': foto,
                'monto_efectivo': monto_efectivo,
                'monto_pagomovil': monto_pagomovil
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def end_route(self, ruta_id, odometro, combustible=0, foto=''):
        try:
            response = self.session.post(f"{self.base_url}/rutas.php", json={
                'action': 'end_route',
                'ruta_id': ruta_id,
                'odometro_valor': odometro,
                'combustible_reportado': combustible,
                'foto_path': foto
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def report_payment(self, monto_efectivo=0, monto_pagomovil=0, foto=''):
        try:
            response = self.session.post(f"{self.base_url}/chofer/reportar_pago.php", json={
                'monto_efectivo': monto_efectivo,
                'monto_pagomovil': monto_pagomovil,
                'comprobante': foto
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_my_status(self):
        try:
            response = self.session.get(f"{self.base_url}/chofer/mi_estado.php")
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_vehicles(self):
        try:
            response = self.session.get(f"{self.base_url}/vehiculos.php")
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def link_telegram(self, telegram_id):
        try:
            response = self.session.post(f"{self.base_url}/usuarios.php", json={
                'telegram_id': telegram_id
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def register_via_token(self, token, telegram_id, nombre, cedula=''):
        try:
            response = self.session.post(f"{self.base_url}/registrar.php", json={
                'token': token,
                'telegram_id': telegram_id,
                'nombre': nombre,
                'cedula': cedula
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def link_owner_via_token(self, token, telegram_id):
        try:
            response = self.session.post(f"{self.base_url}/registrar.php", json={
                'action': 'link_owner',
                'token': token,
                'telegram_id': telegram_id
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def check_authorization(self, telegram_id):
        try:
            response = self.session.get(f"{self.base_url}/usuarios.php?check_auth=1&telegram_id={telegram_id}")
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_my_vehicle(self):
        try:
            response = self.session.get(f"{self.base_url}/vehiculos.php?my_unit=1")
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_active_route(self):
        try:
            response = self.session.get(f"{self.base_url}/rutas.php?active_for_me=1")
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def update_bot_info(self, bot_username):
        """Automatically reports bot username to backend for link generation"""
        try:
            response = self.session.post(f"{self.base_url}/system/update_bot_info.php", json={
                'bot_username': bot_username
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}
