# build environment
FROM node:20 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm ci --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
RUN apk add --no-cache jq
COPY --from=build /app/dist/king /usr/share/nginx/html
COPY docker/startup.sh /usr/local/bin/startup.sh
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /usr/local/bin/startup.sh
EXPOSE 80
CMD ["/usr/local/bin/startup.sh", "nginx", "-g", "daemon off;"]