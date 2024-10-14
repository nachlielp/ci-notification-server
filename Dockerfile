FROM node:22-alpine3.19


COPY . /app/

WORKDIR /app

RUN npm install 

CMD ["node", "server.js"]