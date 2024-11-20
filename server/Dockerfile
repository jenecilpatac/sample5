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
WORKDIR /app

# Install Composer (Laravel's dependency manager)
COPY ./package*.json ./

RUN curl -sS https://getcomposer.org/installer 

RUN composer install

# Generate application key
RUN php artisan key:generate

EXPOSE 5005

CMD ["php-fpm"]
