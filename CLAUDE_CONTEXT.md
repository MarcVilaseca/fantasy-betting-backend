# 🤖 Claude Context - Fantasy Betting Project

> **Instruccions per a Claude**: Llegeix aquest document al començar cada sessió per tenir context complet del projecte.

---

## 📋 Informació Bàsica

- **Projecte**: Fantasy Betting (apostes esportives amb moneda virtual)
- **Ubicació**: `C:\Users\mvilasecab\OneDrive\fantasy\fantasy-betting`
- **URL Producció**: https://fantasy-betting-backend-2fjp.onrender.com
- **GitHub**: https://github.com/MarcVilaseca/fantasy-betting.git
- **Branch**: `master`
- **Hosting**: Render.com (Frankfurt, Free Plan)

---

## 🏗️ Arquitectura

**Tipus**: Monorepo (backend + frontend en un sol projecte)

### Stack Tecnològic
- **Backend**: Node.js 18+, Express.js, PostgreSQL, JWT auth, bcryptjs
- **Frontend**: React 18, Vite, React Router, Axios, Tailwind CSS
- **Base de Dades**: PostgreSQL (Render) + SQLite local (fallback)

### Estructura de Carpetes
```
fantasy-betting/
├── server/               # Backend (Express API)
│   ├── index.js         # Servidor principal (port 5000)
│   ├── config/db.js     # Connexió PostgreSQL + esquema
│   ├── routes/          # Auth, matches, bets, users, admin, fantasy
│   └── utils/           # oddsCalculator
├── src/                 # Frontend (React)
│   ├── App.jsx
│   ├── components/      # BetSlip, MatchCard, Navbar, etc.
│   ├── pages/           # Home, Login, Admin, Leaderboard, MyBets
│   └── utils/           # api.js, AuthContext.jsx
├── scripts/             # Inicialització i migracions
│   ├── init-production.js
│   ├── init-local-db.js
│   └── sync-local-to-render.cjs
├── backups/             # Backups de BD
├── render.yaml          # Config deployment Render
└── package.json         # Dependències backend + frontend
```

---

## 🗄️ Base de Dades

### Configuració
- **Producció**: PostgreSQL a Render (`DATABASE_URL` env var)
- **Local**: PostgreSQL local `postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting`
- **Fitxer config**: `server/config/db.js`

### Taules Principals
1. **users** - Usuaris (coins, admin, created_at)
2. **matches** - Partits (teams, odds, deadline, results)
3. **bets** - Apostes individuals
4. **parlay_bets** - Apostes combinades
5. **parlay_bet_items** - Items de parlays
6. **transactions** - Historial de transaccions
7. **fantasy_scores** - Punts fantasy per equip/jornada

### Esquema
- **Definit en codi** (no hi ha framework de migracions tipus Prisma/Sequelize)
- Les taules es creen automàticament amb `CREATE TABLE IF NOT EXISTS`
- Inicialització: `node scripts/init-production.js`

---

## 🚀 Deployment (Render)

### Auto-deploy Configurat
1. **Push a GitHub** → Render detecta canvis automàticament
2. **Build**: `npm install && npm run build` (compila React a `dist/`)
3. **Start**: `npm run start:prod` (Express serveix frontend + API)

### Variables d'Entorn (Render)
- `NODE_ENV=production`
- `DATABASE_URL` (auto-generat per Render)
- `JWT_SECRET` (configurat manualment)

### Configuració (`render.yaml`)
```yaml
services:
  - type: web
    name: fantasy-betting-backend
    env: node
    region: frankfurt
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod

databases:
  - name: fantasy-betting-db
    region: frankfurt
    plan: free
```

---

## ⚠️ MOLT IMPORTANT: Preservar Dades

### ✅ Canvis SEGURS (no perden dades)
- Modificar components React (`src/`)
- Canviar lògica backend (`server/routes/`, `server/utils/`)
- Actualitzar estils CSS
- Afegir noves funcionalitats sense tocar esquema BD

### ❌ PERILL de Perdre Dades
- **MAI executar** `scripts/init-production.js` en producció (reseteja BD!)
- No canviar esquema de taules sense migració manual
- No eliminar la BD a Render

### Backups
- Últim backup: `backups/render_backup_20251210_141627.sql`
- Fer backup abans de canvis d'esquema

---

## 🔧 Scripts Importants

```bash
# Desenvolupament local
npm run dev          # Vite dev server (frontend)
npm run server       # Express server (backend)
npm start            # Ambdós simultàniament

# Producció
npm run build        # Compila React a dist/
npm run start:prod   # Només Express (serveix dist/)

# Base de dades
node scripts/init-local-db.js      # Inicialitza BD local
node scripts/init-production.js    # Inicialitza BD producció (PERILL!)
node scripts/sync-local-to-render.cjs  # Sincronitza local → Render
```

---

## 🔑 Credencials i Accés

### Admin per defecte
- **Username**: `admin`
- **Password**: `admin123`
- **Coins**: 0 (es pot modificar des de l'admin panel)

### Endpoints API
- Base URL producció: `https://fantasy-betting-backend-2fjp.onrender.com`
- Health check: `/api/health`
- Auth: `/api/auth/login`, `/api/auth/register`
- Matches: `/api/matches`
- Bets: `/api/bets`
- Users: `/api/users`
- Admin: `/api/admin/*`
- Fantasy: `/api/fantasy/scores`

---

## 📝 Flux de Treball Recomanat

### Per fer canvis sense risc:

1. **Edita localment** (`C:\Users\mvilasecab\OneDrive\fantasy\fantasy-betting`)
2. **Prova localment** (opcional):
   ```bash
   npm start  # Proves en local
   ```
3. **Commit i push**:
   ```bash
   git add .
   git commit -m "Descripció del canvi"
   git push origin master
   ```
4. **Render redesplega automàticament** (2-3 minuts)
5. **Verifica**: https://fantasy-betting-backend-2fjp.onrender.com

### Les dades es mantenen perquè:
- La BD PostgreSQL és persistent
- El redesplaçament només actualitza el codi
- No hi ha scripts de reset automàtic

---

## 🐛 Troubleshooting

### Si Render falla al desplegar:
1. Revisa logs a Render Dashboard
2. Verifica que `npm run build` funciona localment
3. Comprova variables d'entorn a Render

### Si la BD es comporta estrany:
1. Comprova que `DATABASE_URL` està configurat
2. Verifica connexió: `node -e "require('./server/config/db.js')"`
3. Consulta backup recent a `backups/`

### Si el frontend no es veu:
1. Assegura't que `npm run build` ha generat `dist/`
2. Verifica que `server/index.js` serveix correctament els estàtics:
   ```javascript
   app.use(express.static(path.join(__dirname, '../dist')));
   ```

---

## 📚 Recursos Addicionals

- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo**: https://github.com/MarcVilaseca/fantasy-betting
- **Documentació Render**: https://render.com/docs

---

## ✨ Com Usar Aquest Document

### Quan comencis una nova sessió amb Claude:

**Opció 1 - Instrucció directa:**
```
Llegeix el fitxer CLAUDE_CONTEXT.md per tenir context del projecte
```

**Opció 2 - Més específica:**
```
Abans de començar, llegeix C:\Users\mvilasecab\OneDrive\fantasy\fantasy-betting\CLAUDE_CONTEXT.md
i després ajuda'm amb [la teva tasca]
```

Claude llegirà aquest document i tindrà tot el context necessari! 🚀

---

**Última actualització**: 2025-12-11
**Versió**: 1.0
