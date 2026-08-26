# CRM Pro - Sistema Integral de Gestión de Clientes y Ventas

Plataforma moderna de **Gestión de Clientes (CRM), Pipeline de Ventas, Catálogo de Productos y Facturación/Cotizaciones**, construida con TypeScript 5.8+ en modo estricto, React 19, Tailwind CSS, Node.js / Express y Prisma ORM con PostgreSQL.

---

## 🚀 Inicio Rápido

### 1. Requisitos
- **Node.js**: v18+ o superior (probado en Node v24)
- **npm**: v9+ o superior
- **Docker & Docker Compose** (para ejecutar el servicio de PostgreSQL)

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Base de Datos PostgreSQL con Docker Compose
Inicia el contenedor de base de datos PostgreSQL:
```bash
npm run docker:db:up
```

Sincroniza el esquema relacional con Prisma e inserta los datos de prueba iniciales (Seed):
```bash
npm run db:push
npm run db:seed
```

### 4. Ejecución en Desarrollo
Puedes iniciar tanto el backend como el frontend en terminales separadas o con los scripts:

```bash
# Terminal 1 - Backend API (Puerto 4000)
npm run dev:server

# Terminal 2 - Frontend Vite SPA (Puerto 5173)
npm run dev:client
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🐳 Ejecución con Docker (Producción)

Levanta el stack completo (PostgreSQL + Server + Client) con un solo comando:

```bash
npm run docker:up
```

Este comando **construye las imágenes** desde el código fuente compilado y levanta los tres servicios:
- **`crm-postgres`** → PostgreSQL 16 en puerto `5432`
- **`crm-server`** → API REST Node.js en puerto `4000`
- **`crm-client`** → Frontend React (Nginx) en puerto `5173`

Una vez iniciado, inserta los datos de prueba:

```bash
npm run docker:seed
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Arquitectura de las Imágenes

| Servicio | Imagen base | Build |
|---|---|---|
| **client** | `nginx:alpine` | Multi-stage: Node.js compila Vite → Nginx sirve `dist/` |
| **server** | `node:20-alpine` | Multi-stage: TypeScript compila `dist/` → Node.js ejecuta |

### Variables de Entorno
Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Las variables configurables son:
```env
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=crm_password
POSTGRES_DB=crm_db
POSTGRES_PORT=5432
SERVER_PORT=4000
CLIENT_PORT=5173
```

---

## 📁 Estructura del Proyecto (Monorepo)

```
crm/
├── packages/
│   ├── shared/                # Tipos TypeScript, Enums y Esquemas de validación Zod
│   │   ├── src/
│   │   │   ├── types/         # Interfaces de Clientes, Tratos, Productos, Ventas, Analíticas
│   │   │   ├── schemas/       # Validadores Zod
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── server/                # Backend API REST con Express & Prisma ORM
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Modelos de Base de Datos relacional
│   │   ├── src/
│   │   │   ├── controllers/   # Controladores REST
│   │   │   ├── services/      # Lógica de negocio y consultas Prisma
│   │   │   ├── routes/        # Rutas de API (/api/customers, /api/deals, etc.)
│   │   │   ├── seed.ts        # Script de población de datos iniciales
│   │   │   └── index.ts       # Servidor Express
│   │   ├── Dockerfile         # Multi-stage build: Node.js 20 Alpine
│   │   ├── docker-entrypoint.sh
│   │   └── package.json
│   │
│   └── client/                # Frontend SPA con React + Vite + TailwindCSS
│       ├── src/
│       │   ├── api/           # Cliente HTTP tipado hacia el Backend
│       │   ├── components/    # Componentes modales, badges, tarjetas de métricas, navegación
│       │   ├── pages/         # Vistas: Dashboard, Pipeline Kanban, Clientes, Catálogo, Ventas
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile         # Multi-stage build: Node.js 20 Alpine → Nginx Alpine
│       ├── nginx.conf         # Proxy /api/ al backend, SPA fallback, gzip
│       └── package.json
│
├── docker-compose.yml         # Orquestación: postgres + server + client
├── .dockerignore
├── package.json               # Configuración de Workspaces npm
└── tsconfig.base.json         # Configuración estricta de TypeScript
```

---

## ✨ Módulos y Funcionalidades

1. **📊 Dashboard Ejecutivo**:
   - KPIs en tiempo real (Ingresos totales cobrados, Ingresos del mes con % de crecimiento, Pipeline activo, Tasa de conversión Win Rate).
   - Gráfico de área de evolución mensual de ingresos (Recharts).
   - Gráfico de barras de distribución de oportunidades por etapa del embudo comercial.
   - Rankings de Top Clientes y Productos más vendidos.

2. **📌 Pipeline de Ventas (Tablero Kanban)**:
   - 6 columnas por etapa: *Prospección, Calificación, Propuesta, Negociación, Ganada, Perdida*.
   - Totales monetarios y conteo por etapa.
   - Tarjetas de oportunidades con prioridad, probabilidad interactiva, cliente asociado y monto.
   - Botones rápidos de avance/retroceso de fase y creación modal de oportunidades.

3. **👥 Directorio de Clientes y Leads**:
   - Filtros por estado (*Cliente, Prospecto, Lead, Inactivo*) y búsqueda instantánea.
   - Tabla completa con iniciales, empresa, email, teléfono, etiquetas y conteo de interacciones.
   - Ficha detallada de cliente con historial de tratos, facturas emitidas y registro de actividades (llamadas, reuniones, notas, tareas).

4. **📦 Catálogo de Productos y Servicios**:
   - Gestión de servicios, suscripciones recurrentes y productos físicos con códigos SKU.
   - Cálculo automático de margen estimado sobre costo y control de stock.

5. **🧾 Cotizaciones y Facturación**:
   - Generación de Presupuestos/Cotizaciones y Facturas comerciales.
   - Constructor de ítems dinámicos con selección de catálogo, cantidades, precios y descuentos por fila.
   - Cálculo en tiempo real de Subtotal, IVA (21%) y Total.
   - Conversión de Cotización a Factura con un solo clic.
   - Vista de comprobante con opción de impresión o exportación a PDF.

---

## 🛠️ Comandos Útiles

### Docker (Producción)
| Comando | Descripción |
|---|---|
| `npm run docker:up` | Construye y levanta todo el stack (postgres + server + client) |
| `npm run docker:down` | Detiene y elimina todos los contenedores |
| `npm run docker:build` | Reconstruye las imágenes sin levantar los contenedores |
| `npm run docker:logs` | Sigue los logs de todos los servicios |
| `npm run docker:seed` | Inserta datos de prueba en la BD (ejecuta dentro del contenedor) |

### Desarrollo Local
| Comando | Descripción |
|---|---|
| `npm run docker:db:up` | Inicia solo el contenedor PostgreSQL en segundo plano |
| `npm run docker:db:down` | Detiene el contenedor PostgreSQL |
| `npm run docker:db:logs` | Muestra los registros del contenedor PostgreSQL |
| `npm run build` | Compila TypeScript y construye todos los paquetes |
| `npm run dev:server` | Ejecuta el servidor API con recarga en caliente (`tsx watch`) |
| `npm run dev:client` | Ejecuta el frontend con Vite HMR |
| `npm run db:push` | Sincroniza el esquema de Prisma con PostgreSQL |
| `npm run db:seed` | Inserta datos de prueba en la base de datos |
| `npm run db:studio` | Abre la interfaz visual de Prisma Studio para inspeccionar la BD |
