FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY PoppyAndCharlie.jpg /usr/share/nginx/html/PoppyAndCharlie.jpg
RUN chmod -R a+rX /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html
