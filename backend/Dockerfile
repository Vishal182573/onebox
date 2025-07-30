FROM node:18-bullseye-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 8000
CMD [ "node", "dist/index.js" ]