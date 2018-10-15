FROM nginx:alpine
COPY / /usr/share/nginx/html/
RUN mv /usr/share/nginx/html/nginx.conf /etc/nginx/ \
    && rm /usr/share/nginx/html/Dockerfile
