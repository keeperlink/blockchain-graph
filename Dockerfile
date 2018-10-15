FROM keeperlink/gulp-sass:latest AS gulp_builder
WORKDIR /code
COPY gulp ./gulp
COPY src ./src
COPY package.json gulpfile.js .jshintrc ./
RUN npm install && gulp prod_build && rm -fr node_modules .sass-cache src gulp


FROM nginx:alpine
COPY --from=gulp_builder /code/dist /usr/share/nginx/html
RUN mv /usr/share/nginx/html/nginx.conf /etc/nginx/
