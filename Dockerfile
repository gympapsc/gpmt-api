FROM node:latest
WORKDIR app/
COPY package.json .
COPY package-lock.json .
COPY ./src .
RUN npm install --only=production
EXPOSE 80

ARG API_VERSION="0.0.0"
ENV API_VERSION ${API_VERSION}

CMD ["node", "app.js"]
