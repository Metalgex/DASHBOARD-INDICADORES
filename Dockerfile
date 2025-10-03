FROM node:18

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./
RUN npm install --omit=dev

# Copiar solo los archivos necesarios
COPY server.js .
COPY index.html .

EXPOSE 3000
CMD ["npm", "start"]
