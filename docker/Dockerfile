# Local development only: PHP 8.2 with mysqli for UltraStats
FROM php:8.2-cli

RUN docker-php-ext-install mysqli

COPY entrypoint.sh /entrypoint.sh
COPY entrypoint-install-e2e.sh /entrypoint-install-e2e.sh
COPY wait-schema.php /wait-schema.php
RUN mkdir -p /usr/local/share/ultrastats
COPY seed-database.php /usr/local/share/ultrastats/seed-database.php
RUN chmod +x /entrypoint.sh /entrypoint-install-e2e.sh

WORKDIR /var/www/html
EXPOSE 8091
ENTRYPOINT ["/entrypoint.sh"]
