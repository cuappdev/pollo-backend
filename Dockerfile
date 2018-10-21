FROM node:carbon

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN npm install
EXPOSE 3000

CMD npm run prod
