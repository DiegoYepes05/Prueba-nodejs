#!/bin/sh
set -e

# Sincroniza el esquema con la base de datos antes de arrancar la API.
# Usamos `db push` porque este proyecto no versiona migraciones; si las
# agregaras, cámbialo por: npx prisma migrate deploy
echo "Sincronizando esquema de Prisma con la base de datos..."
npx prisma db push --skip-generate

exec "$@"
