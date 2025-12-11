# Guia de Desplegament a Render

Aquesta aplicació està configurada per desplegar-se completament a Render (backend + frontend + PostgreSQL).

## Prerequisits

1. Compte de Render (gratuït): https://render.com
2. Repositori de GitHub amb el codi
3. Les dades ja sincronitzades localment

## Passos per Desplegar

### 1. Crear compte a Render

1. Ves a https://render.com
2. Registra't amb el teu compte de GitHub
3. Autoritza Render per accedir als teus repositoris

### 2. Desplegar des de GitHub

**Opció A: Usando render.yaml (RECOMANAT)**

1. A Render Dashboard, clica "New +"
2. Selecciona "Blueprint"
3. Connecta el repositori `fantasy-betting-backend`
4. Render detectarà automàticament el fitxer `render.yaml`
5. Clica "Apply" i esperarà que es creïn:
   - Web Service (backend + frontend)
   - PostgreSQL Database

**Opció B: Manual**

Si prefereixes configurar-ho manualment:

1. **Crear la base de dades:**
   - A Render Dashboard, clica "New +"
   - Selecciona "PostgreSQL"
   - Nom: `fantasy-betting-db`
   - Database: `fantasy_betting`
   - Region: Frankfurt
   - Plan: Free
   - Clica "Create Database"
   - **Guarda la "Internal Database URL"** (la necessitaràs després)

2. **Crear el web service:**
   - A Render Dashboard, clica "New +"
   - Selecciona "Web Service"
   - Connecta el repositori `fantasy-betting-backend`
   - Configuració:
     - Name: `fantasy-betting`
     - Region: Frankfurt
     - Branch: `master` (o `main`)
     - Root Directory: (deixa en blanc)
     - Environment: `Node`
     - Build Command: `npm run render-build`
     - Start Command: `npm start`
     - Plan: Free

3. **Configurar variables d'entorn:**

   A la secció "Environment Variables", afegeix:

   ```
   NODE_ENV=production
   DATABASE_URL=[enganxa aquí la Internal Database URL]
   JWT_SECRET=[genera un string aleatori, per exemple: mySuper$ecretKey123!]
   ```

4. Clica "Create Web Service"

### 3. Inicialitzar la base de dades

Un cop desplegat, la base de dades estarà buida. Has d'inicialitzar-la:

**Opció 1: Des del Shell de Render**

1. Al teu web service a Render, ves a "Shell"
2. Executa:
   ```bash
   node scripts/init-production.js
   ```

**Opció 2: Sincronitzar des de local**

Si ja tens dades a local (usuaris, partits, apostes):

1. Edita `scripts/sync-local-to-render.cjs`
2. Canvia la `connectionString` de Render per la teva DATABASE_URL
3. A local, executa:
   ```bash
   node scripts/sync-local-to-render.cjs
   ```

### 4. Verificar el desplegament

1. Ves a la URL del teu servei (per exemple: `https://fantasy-betting.onrender.com`)
2. Hauries de veure el frontend funcionant
3. Prova fer login amb l'usuari admin:
   - Username: `admin`
   - Password: `admin123`

## Actualitzacions futures

Per actualitzar l'aplicació:

1. Fes canvis a local
2. Commit i push a GitHub:
   ```bash
   git add .
   git commit -m "Descripció dels canvis"
   git push
   ```
3. Render detectarà automàticament els canvis i redesplegarà

## Estructura del projecte

```
fantasy-betting/
├── server/              # Backend
│   ├── index.js        # Server principal
│   ├── routes/         # API routes
│   ├── config/         # Configuració BD
│   ├── utils/          # Utilities
│   └── data/           # Data files
├── src/                # Frontend React
│   ├── components/     # React components
│   ├── pages/          # React pages
│   └── utils/          # Frontend utilities
├── dist/               # Build output (generat automàticament)
├── scripts/            # Scripts d'inicialització (NO es pugen a git)
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── render.yaml         # Configuració Render
└── package.json        # Dependencies + scripts (un sol fitxer!)
```

## Variables d'entorn necessàries

- `NODE_ENV`: `production`
- `DATABASE_URL`: URL de PostgreSQL (auto-generada per Render)
- `JWT_SECRET`: Clau secreta per tokens JWT

## Comandos útils

- `npm start`: Mode desenvolupament (frontend + backend simultanis)
- `npm run server`: Només servidor backend
- `npm run dev`: Només frontend (Vite)
- `npm run build`: Build del frontend per producció
- `npm run start:prod`: Servidor producció (serveix dist/)

## Troubleshooting

### El frontend no es veu

- Verifica que el build s'hagi completat correctament als logs de Render
- Comprova que existeixi la carpeta `frontend/dist/`

### Error de connexió a la BD

- Verifica que `DATABASE_URL` estigui ben configurada
- Comprova que la base de dades estigui activa

### L'app "s'adorm"

- Render Free plan adorm els serveis després de 15 minuts d'inactivitat
- El primer accés després d'adormir-se pot trigar 30-60 segons

## Suport

Si tens problemes:
1. Revisa els logs a Render Dashboard → [el teu servei] → Logs
2. Comprova que totes les variables d'entorn estiguin configurades
3. Verifica que el build s'hagi completat correctament
