FROM node:16

RUN apt install git

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm i

WORKDIR /app/frontend

RUN npm i

RUN npm run build

WORKDIR /app

EXPOSE 8080

CMD npm run start
