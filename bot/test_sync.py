import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()
BACKEND_URL = os.getenv('BACKEND_URL')

async def test_sync():
    print(f"Testing sync to {BACKEND_URL}/system/update_config.php")
    async with httpx.AsyncClient(verify=False) as client:
        try:
            resp = await client.post(
                f"{BACKEND_URL}/system/update_config.php",
                json={"clave": "bcv_rate", "valor": "474.05"}
            )
            print(f"Status: {resp.status_code}")
            print(f"Body: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_sync())
