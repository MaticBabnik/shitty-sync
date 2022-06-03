FROM node:14 as build-frontend

RUN apt install git

COPY . /app

WORKDIR /app/frontend

RUN chmod +x setvars.sh

RUN npm i && npm run build

FROM node:14 as base

COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

WORKDIR /app

COPY ./src ./src
COPY ./package.json .
COPY ./tsconfig.json .

RUN npm i

FROM node:14 as run

COPY --from=base /app /app

WORKDIR /app

RUN npx tsc

# default args
ARG PORT=8080
ARG PORT_METRICS=9090
#ARG NO_METRICS="false"

# set env variables
ENV PORT=$PORT
ENV PORT_METRICS=$PORT_METRICS
#ENV NO_METRICS=$NO_METRICS

EXPOSE $PORT
EXPOSE $PORT_METRICS

ENTRYPOINT ["node","out/main.js"]
