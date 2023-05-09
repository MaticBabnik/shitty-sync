FROM node:18 as getenv
RUN apt install git

COPY .git /app/.git

COPY setvars.sh /app

WORKDIR /app
RUN chmod +x /app/setvars.sh
RUN /app/setvars.sh
RUN cat .env

FROM node:18 as build-frontend

COPY frontend /frontend
COPY --from=getenv /app/.env /frontend
WORKDIR /frontend


RUN npm i && npm run build

FROM nginx:stable

COPY --from=build-frontend /frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]