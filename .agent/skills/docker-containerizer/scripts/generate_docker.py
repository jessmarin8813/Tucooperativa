import os

def create_docker_configs():
    print("========================================")
    print("[DOCKER] DOCKER CONTAINERIZER (XAMPP TO CLOUD)")
    print("========================================\n")

    dockerfile_content = """# Dockerfile para PHP + Apache
FROM php:8.1-apache

# Habilitar mod_rewrite para el enrutamiento de la API PHP
RUN a2enmod rewrite headers

# Instalar extensiones necesarias (PDO MySQL)
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Configurar el DocumentRoot (Asumiendo que toda la app corre aquí)
# Si Apache da error con los assets de react, puedes separar el build en nginx
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar el codigo fuente
COPY . /var/www/html/

# Ajustar Permisos (www-data)
RUN chown -R www-data:www-data /var/www/html
"""

    docker_compose_content = """version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASS=secret
      - DB_NAME=contratos_db_v3
    depends_on:
      - db

  db:
    image: mysql:8.0
    ports:
      - "3307:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=contratos_db_v3
    volumes:
      - db_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  db_data:
"""

    with open("Dockerfile", "w", encoding="utf-8") as f:
        f.write(dockerfile_content)
    
    with open("docker-compose.yml", "w", encoding="utf-8") as f:
        f.write(docker_compose_content)

    print("[OK] Se genero el archivo `Dockerfile` (PHP 8.1 Apache + PDO).")
    print("[OK] Se genero el archivo `docker-compose.yml` (Apache + MySQL MySQL 8).")
    print("\n----------------------------------------")
    print("Instrucciones de Despliegue:")
    print("1. Ejecuta: docker-compose up -d --build")
    print("2. Visita: http://localhost:8080")

if __name__ == "__main__":
    create_docker_configs()
