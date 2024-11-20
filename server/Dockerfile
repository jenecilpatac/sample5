FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk --no-cache add \
    zlib-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd \
    && docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www

# Install Composer (Laravel's dependency manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set correct ownership for the entire Laravel project (done after copy)
COPY . /var/www

# Ensure the correct permissions for storage and cache directories
RUN chown -R www-data:www-data /var/www && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache && \
    find /var/www/storage -type f -exec chmod 664 {} \;

# Set file permissions for the rest of the Laravel project (optional, but recommended)
RUN chmod -R 775 /var/www

# Switch to the www-data user
USER www-data

# Set up the Laravel environment (generate application key)
RUN php artisan key:generate

EXPOSE 5005

CMD ["php-fpm"]
