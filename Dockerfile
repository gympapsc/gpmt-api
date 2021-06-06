FROM node:latest
WORKDIR app/
COPY package.json .
COPY package-lock.json .
COPY ./src .
RUN npm install --only=production
EXPOSE 80

CMD ["node", "app.js"]