# King Build Image
FROM node:19-alpine as dist

WORKDIR /src

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build-prod

# King Nginx image
FROM nginx:1.23.2-alpine as nginx

COPY --from=dist /src/dist/king  /usr/share/nginx/html
