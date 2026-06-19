# --- Etapa de build: instala todo y compila TS + genera el cliente Prisma ---
FROM node:22-alpine AS build
WORKDIR /app

# Prisma necesita OpenSSL para generar/ejecutar su motor en Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Etapa de runtime: solo dependencias de producción + dist ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# El motor de Prisma también necesita OpenSSL en runtime
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

# Reutilizamos el cliente Prisma ya generado y el código compilado
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
