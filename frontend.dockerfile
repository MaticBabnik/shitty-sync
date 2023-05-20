FROM node:18 as getenv
ARG VITE_NEWS_BASE_URL="https://blog.babnik.io"
ARG VITE_NEWS_API_KEY="df507f44712874951daebff6e9"
ARG VITE_NEWS_TAG="sync"

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