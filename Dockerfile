FROM node:16 as build-frontend

RUN apt install git

COPY . /app

WORKDIR /app/frontend

RUN npm i && npm run build

FROM node:16-alpine as base

COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

WORKDIR /app

COPY ./src ./src
COPY ./package.json .
COPY ./tsconfig.json .

RUN npm i

FROM node:16-alpine as run

COPY --from=base /app /app

WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["npm", "run", "start"]
