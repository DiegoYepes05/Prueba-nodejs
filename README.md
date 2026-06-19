# API de Confiabilidad de Conductores

API REST que registra conductores y viajes de camiones, y calcula un **puntaje de confiabilidad (0–100)** por conductor a partir de su historial de viajes.

Stack: **Node.js + Express + TypeScript + PostgreSQL (Prisma)**. Validación con **Zod** y pruebas con **Vitest**.

---

## Cómo correrlo

Requisitos: Node 18+ y Docker (para Postgres) — o un PostgreSQL propio.

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env        # ajusta DATABASE_URL si usas tu propio Postgres

# 3. Levantar PostgreSQL (opcional, si no tienes uno)
docker compose up -d

# 4. Crear las tablas en la base de datos
npm run prisma:migrate      # o, más rápido para la prueba: npm run db:push

# 5. (Opcional) Cargar datos de ejemplo
npm run seed

# 6. Arrancar en desarrollo (recarga en caliente)
npm run dev
```

La API queda en `http://localhost:3000`. Healthcheck: `GET /health`.

### Correr todo en contenedores (app + DB)

Si prefieres no instalar nada local, levanta la app y la base juntas:

```bash
docker compose up --build
```

La app espera a que Postgres esté saludable, sincroniza el esquema (`prisma db push`) y arranca en `http://localhost:3000`.

### Otros comandos

```bash
npm test           # corre los tests (no requieren base de datos)
npm run seed       # carga conductores y viajes de ejemplo
npm run build      # compila a dist/
npm start          # corre la versión compilada
```

### Probar con Postman

Importa `postman_collection.json`. Ejecuta **"Crear conductor"** primero: guarda el `id` en la variable `{{conductorId}}` y el resto de requests (registrar viaje, obtener por id) lo reutilizan automáticamente.

---

## Lógica del puntaje

Implementada como función pura en [`src/score/score.ts`](src/score/score.ts):

| Regla | Efecto |
|---|---|
| Base | Empieza en **50** |
| Viaje a tiempo | **+10** por cada uno, con tope acumulado de **+40** |
| Viaje no a tiempo | **−15** por cada uno |
| Experiencia | **+5** si tiene **5 o más** viajes |
| Límites | Nunca baja de **0** ni sube de **100** |

El puntaje **no se almacena**: se recalcula al vuelo desde los viajes en cada consulta, así siempre es consistente con los datos.

---

## Endpoints

### `POST /conductores`
Registra un conductor. La cédula es única.
```json
{ "nombre": "Ana Pérez", "cedula": "1023456789", "ciudad": "Bogotá" }
```
Respuestas: `201` creado · `400` datos inválidos · `409` cédula ya registrada.

### `POST /viajes`
Registra un viaje de un conductor existente. `aTiempo` acepta `true/false` o `"si"/"no"`.
```json
{
  "origen": "Bogotá",
  "destino": "Medellín",
  "valorFlete": 2500000,
  "aTiempo": true,
  "conductorId": "<uuid-del-conductor>"
}
```
Respuestas: `201` creado · `400` datos inválidos · `404` conductor inexistente.

### `GET /conductores/:id`
Devuelve el conductor con su puntaje y estadísticas.
```json
{
  "id": "…", "nombre": "Ana Pérez", "cedula": "1023456789", "ciudad": "Bogotá",
  "puntaje": 75, "totalViajes": 3, "viajesATiempo": 3, "viajesNoATiempo": 0
}
```
Respuestas: `200` · `404` no encontrado.

### `GET /conductores`
Lista todos los conductores con su puntaje, **ordenados de mayor a menor**.

### Ejemplo rápido con curl
```bash
# Crear conductor
curl -s -X POST localhost:3000/conductores \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","cedula":"123","ciudad":"Bogotá"}'

# Registrar viaje (usa el id devuelto arriba)
curl -s -X POST localhost:3000/viajes \
  -H 'Content-Type: application/json' \
  -d '{"origen":"Bogotá","destino":"Cali","valorFlete":2000000,"aTiempo":true,"conductorId":"<id>"}'

# Ver ranking
curl -s localhost:3000/conductores
```

---

## Organización del código

Separación por capas y por dominio (rutas → controlador → servicio → repositorio):

```
src/
├── score/score.ts            # lógica del puntaje (pura, sin dependencias)
├── modules/
│   ├── conductores/          # schema (Zod) · repository (Prisma) · service · controller · routes
│   └── viajes/
├── middlewares/              # validación de entrada y manejo central de errores
├── errors/AppError.ts        # error de dominio con código HTTP
├── lib/prisma.ts             # cliente Prisma (singleton)
├── config/env.ts             # configuración por entorno
├── app.ts                    # ensambla Express (testeable sin abrir puerto)
└── server.ts                 # arranque + cierre ordenado
tests/                        # score (unit) + api (integración con Prisma mockeado)
prisma/schema.prisma          # modelos Conductor y Viaje
```

- **Controlador**: solo HTTP (lee request, responde, delega errores).
- **Servicio**: reglas de negocio (cédula única, conductor debe existir, cálculo de puntaje).
- **Repositorio**: único punto que habla con la base de datos.

---

## Qué haría distinto con más tiempo

- **Paginación y filtros** en `GET /conductores` (hoy trae todo y ordena en memoria); con muchos conductores el cálculo del puntaje convendría moverlo a una consulta SQL agregada o a una vista materializada.
- **Tests de integración con DB real** (Testcontainers) además de los actuales con Prisma mockeado, para validar migraciones y restricciones reales.
- **`valorFlete` como `BigInt` o `Decimal`**: hoy es `INTEGER` (tope ~2.147e9 COP), suficiente para fletes normales pero limitante en cargas de muy alto valor.
- **Observabilidad**: logger estructurado (pino), request-id y manejo de logs en vez de `console`.
- **OpenAPI/Swagger** generado desde los esquemas Zod, y una colección de Postman.
- **Autenticación/roles** y rate limiting si la API se expone públicamente.
- **CI** (lint + typecheck + tests) y migraciones versionadas (`prisma migrate`) en vez de `db push` para entornos productivos.
