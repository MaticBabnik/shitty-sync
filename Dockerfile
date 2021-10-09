FROM node:16 as build-frontend

RUN apt install git

WORKDIR /app

COPY ./frontend .

RUN npm i && npm run build

FROM node:16-alpine as base

COPY --from=build-frontend /app/dist /app/frontend/dist

WORKDIR /app

COPY ./src ./src
COPY ./static ./static
COPY ./app.js .
COPY ./package.json .
COPY ./tsconfig.json .

RUN npm i

FROM node:16-alpine as run

COPY --from=base /app /app

WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["npm", "run", "start"]
