# Usa una imagen base de Node.js
FROM node:20.15.1

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que la aplicación escuchará
EXPOSE 8000

# Ejecuta la aplicación
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then npm start; else npm run dev; fi"]