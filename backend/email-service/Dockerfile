# Използваме лека версия на Node.js
FROM node:18-alpine

# Създаваме работна директория вътре в контейнера
WORKDIR /usr/src/app

# Копираме package.json и package-lock.json
COPY package*.json ./

# Инсталираме зависимостите (nodemailer, amqplib и т.н.)
RUN npm install

# Копираме целия останал код
COPY . .

# Отваряме порт
EXPOSE 3000

# Командата за стартиране
CMD ["node", "index.js"]
