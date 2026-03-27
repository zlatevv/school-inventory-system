# Използваме Nginx за сервиране на статични файлове
FROM nginx:alpine

# Изтриваме стандартните файлове на Nginx, за да не ни пречат
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копираме HTML файловете ДИРЕКТНО в главната директория
COPY html/ /usr/share/nginx/html/

# Копираме CSS и JS файловете в техни собствени подпапки
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
