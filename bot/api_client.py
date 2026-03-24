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

    def start_route(self, vehiculo_id, odometro, foto=''):
        try:
            response = self.session.post(f"{self.base_url}/rutas.php", json={
                'action': 'start_route',
                'vehiculo_id': vehiculo_id,
                'odometro_valor': odometro,
                'foto_path': foto
            })
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def end_route(self, ruta_id, odometro, foto=''):
        try:
            response = self.session.post(f"{self.base_url}/rutas.php", json={
                'action': 'end_route',
                'ruta_id': ruta_id,
                'odometro_valor': odometro,
                'foto_path': foto
            })
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

    def register_via_token(self, token, telegram_id, nombre):
        try:
            response = self.session.post(f"{self.base_url}/registrar.php", json={
                'token': token,
                'telegram_id': telegram_id,
                'nombre': nombre
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
