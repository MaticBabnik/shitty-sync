FROM node:18 as base

WORKDIR /app

COPY ./src ./src
COPY ./package.json .
COPY ./tsconfig.json .

RUN npm i
RUN npx tsc


FROM node:18 as run

COPY --from=base /app /app

WORKDIR /app

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

ENTRYPOINT ["node","out/index.js"]
