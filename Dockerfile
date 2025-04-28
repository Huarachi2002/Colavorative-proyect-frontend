FROM node:20-alpine AS base

# Instalación de dependencias sólo si es necesario
FROM base AS deps
WORKDIR /app

# Instalar dependencias nativas necesarias para canvas
RUN apk add --no-cache build-base cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev python3 make g++

# Copiar package.json y package-lock.json o yarn.lock
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci

# Construir la aplicación
FROM base AS builder
WORKDIR /app

# Instalar dependencias nativas necesarias para canvas en la etapa de builder también
RUN apk add --no-cache build-base cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Etapa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Instalar las dependencias de runtime necesarias para canvas
RUN apk add --no-cache cairo pango jpeg giflib librsvg

# Crear un usuario no-root para producción
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Si standalone no está disponible, copia toda la carpeta .next
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Configurar permisos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto
EXPOSE 3000

# Variable de entorno para el host
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar la aplicación
CMD ["npm", "start"]