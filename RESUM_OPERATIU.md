# RESUM OPERATIU - FANTASY BETTING
**Data:** 10 de desembre de 2024
**Estat:** ✅ COMPLETAMENT DESPLEGAT I OPERATIU

---

## 🌐 URLS DE L'APLICACIÓ

### Frontend (Vercel)
- **URL Producció:** https://bet-vomistarlaliga.vercel.app
- **Plataforma:** Vercel (Free Tier)
- **Framework:** React + Vite
- **Build:** Automàtic amb cada push a GitHub

### Backend (Render)
- **URL API:** https://fantasy-betting-backend.onrender.com
- **Plataforma:** Render (Free Tier)
- **Runtime:** Node.js + Express
- **Base de dades:** PostgreSQL (Free Tier)

### Repositori GitHub
- **URL:** https://github.com/MarcVilaseca/fantasy-betting-backend
- **Branch principal:** main
- **Contingut:** Backend + Frontend en el mateix repositori

---

## 📊 INFRAESTRUCTURA I LÍMITS

### Vercel (Frontend)
**Pla:** Free Tier
**Límits mensuals:**
- ✅ Bandwidth: 100 GB/mes (ús actual estimat: ~2 GB/mes amb 14 usuaris)
- ✅ Invocacions: Il·limitades
- ✅ Builds: 6000 minuts/mes
- ✅ Projectes: Il·limitats
- ✅ Deployments: Il·limitats

**Previsió:** Amb 14 usuaris, estàs al **2% del límit**. No cal pagar res.

### Render (Backend)
**Pla:** Free Tier
**Límits:**
- ✅ 750 hores/mes (suficient)
- ⚠️ **Es "dorm" després de 15 minuts d'inactivitat**
  - Primera petició després de dormir: triga ~30 segons
  - Solució: Si hi ha usuaris actius durant el dia, no es dormirà

**Previsió:** Amb 14 usuaris actius, el servei probablement mai es dormirà durant les hores d'ús.

### PostgreSQL (Render)
**Pla:** Free Tier
**Límits:**
- ✅ 1 GB d'emmagatzematge
- ⚠️ **EXPIRA: 9 de gener de 2026**

**ACCIÓ REQUERIDA ABANS DEL 9 DE GENER DE 2026:**
1. **Opció 1 (Recomanada - Gratuïta):** Migrar a un altre servei PostgreSQL gratuït:
   - **Supabase** (500 MB gratuït permanent)
   - **Neon** (512 MB gratuït permanent)
   - **ElephantSQL** (20 MB gratuït permanent)

2. **Opció 2:** Renovar el free tier de Render (si encara ho ofereixen)

3. **Opció 3:** Pagar Render ($7/mes per PostgreSQL)

**NOTA:** La migració és senzilla - només cal exportar les dades i canviar la variable d'entorn `DATABASE_URL`.

---

## 🔧 CONFIGURACIÓ ACTUAL

### Variables d'entorn Frontend (Vercel)
```
VITE_API_URL=https://fantasy-betting-backend.onrender.com/api
```

### Variables d'entorn Backend (Render)
```
DATABASE_URL=postgresql://fantasy_betting_db_user:PASSWORD@dpg-d4shvrmmcj7s73c0oll0-a/fantasy_betting_db
JWT_SECRET=(configurat)
NODE_ENV=production
```

### Base de dades PostgreSQL
- **Hostname:** dpg-d4shvrmmcj7s73c0oll0-a
- **Database:** fantasy_betting_db
- **User:** fantasy_betting_db_user
- **Port:** 5432

---

## 🚀 COM FUNCIONA EL DESPLEGAMENT

### Workflow automàtic:
1. **Fas canvis al codi localment**
2. **Fas commit i push a GitHub:**
   ```bash
   git add .
   git commit -m "Descripció dels canvis"
   git push origin master:main
   ```
3. **Vercel detecta el push automàticament** i redesplega el frontend
4. **Render redesplega el backend** (si hi ha canvis a la carpeta backend)

**Temps de desplegament:** 2-5 minuts

---

## 👥 CAPACITAT I RENDIMENT

### Usuaris suportats
- **Límit teòric:** 1000+ usuaris simultanis (amb free tier)
- **Usuaris reals:** 14 usuaris
- **Capacitat utilitzada:** ~1% dels recursos disponibles

### Rendiment esperat
- **Primera càrrega:** ~2-3 segons (si el backend està despert)
- **Primera càrrega (backend adormit):** ~30-35 segons
- **Navegació interna:** Instantània (SPA)

---

## 📦 FUNCIONALITATS IMPLEMENTADES

### Usuaris
- ✅ Registre i login amb JWT
- ✅ Sistema de monedes virtuals
- ✅ Leaderboard (classificació per monedes)
- ✅ Historial de transaccions

### Apostes
- ✅ Apostes simples (1 partit)
- ✅ Apostes combinades/parlay (2-4 partits)
- ✅ Cancel·lació d'apostes (amb retorn de monedes)
- ✅ Apostes públiques (veure apostes de tots els usuaris)
- ✅ Bloqueig temporal d'apostes (configurable)

### Partits
- ✅ Crear partits (admin)
- ✅ Actualitzar resultats (admin)
- ✅ Càlcul automàtic de quotes realistes
- ✅ Estat: obert, tancat, finalitzat
- ✅ Validació: els jugadors no poden apostar en els seus propis partits

### Fantasy
- ✅ Sistema de puntuació fantasy independent
- ✅ Classificació general
- ✅ Historial per jornades
- ✅ Afegir punts fantasy (admin)

### Administració
- ✅ Panel d'administració
- ✅ Crear/editar partits
- ✅ Actualitzar resultats
- ✅ Gestionar monedes d'usuaris
- ✅ Cash out d'usuaris
- ✅ Afegir puntuacions fantasy

---

## 🛠 MANTENIMENT

### Tasques regulars
- **Cap tasca necessària** - Tot és automàtic

### Monitoratge recomanat
1. Comprovar cada mes:
   - Ús de bandwidth a Vercel (Dashboard → Usage)
   - Ús de PostgreSQL a Render (Dashboard → Database)

2. Backups (RECOMANAT):
   - Fer backup manual de la BD cada mes
   - Comando:
     ```bash
     pg_dump [DATABASE_URL] > backup_YYYY-MM-DD.sql
     ```

### En cas de problemes
1. **Frontend no carrega:**
   - Comprova Vercel dashboard → Deployments
   - Revisa logs del deployment

2. **Backend no respon:**
   - Comprova Render dashboard → Logs
   - El backend pot estar "despertant" (espera 30s)

3. **Errors de connexió:**
   - Verifica variables d'entorn a Vercel
   - Comprova que DATABASE_URL sigui correcta a Render

---

## 📅 CALENDARI D'ACCIONS

### Immediat
- ✅ Tot desplegat i funcionant

### Gener 2025
- **Cap acció necessària**

### Desembre 2025 (IMPORTANT)
- ⚠️ **Abans del 9 de gener de 2026:** Migrar PostgreSQL a un altre servei gratuït
- Opcions recomanades: Supabase o Neon
- Temps estimat: 1-2 hores per fer la migració

---

## 💰 COSTOS ACTUALS I FUTURS

### Cost actual: **0 €/mes** ✅

### Escenaris futurs:

**Escenari 1: Continuar gratuït (RECOMANAT)**
- Migrar PostgreSQL a Supabase/Neon abans del gener 2026
- Cost: 0 €/mes permanent

**Escenari 2: Pagar PostgreSQL**
- Mantenir Render PostgreSQL
- Cost: ~7 €/mes

**Escenari 3: Escalar (si creixeu molt)**
- Vercel Pro: 20 €/mes (100 GB → 1 TB bandwidth)
- Render Starter: 7 €/mes (backend sempre despert)
- PostgreSQL Starter: 7 €/mes (25 GB)
- **Total: 34 €/mes** (només si supereu 100+ usuaris actius)

---

## 🔐 CREDENCIALS I ACCESSOS

### GitHub
- **Propietari:** MarcVilaseca
- **Repositori:** fantasy-betting-backend (públic/privat)

### Vercel
- **Compte:** Vinculat amb GitHub
- **Project:** Bet-Vomistarlaliga

### Render
- **Compte:** (el teu compte de Render)
- **Services:**
  - Web Service: fantasy-betting-backend
  - PostgreSQL: fantasy_betting_db

### PostgreSQL
- **Accés:** Només des del backend de Render
- **Connexió externa:** Disponible amb credencials (veure Render dashboard)

---

## 📚 DOCUMENTACIÓ ADDICIONAL

### Fitxers del projecte:
- `README.md` - Documentació general
- `LOGS.md` - Historial detallat de desenvolupament
- `QUICKSTART.md` - Guia ràpida d'inici
- `API_EXAMPLES.md` - Exemples d'ús de l'API
- `Reglas de apuestas.pdf` - Regles del sistema

### Estructura del projecte:
```
fantasy-betting/
├── backend/           # Node.js + Express + PostgreSQL
│   ├── config/       # Configuració BD
│   ├── routes/       # Endpoints API
│   ├── data/         # Dades estàtiques (equips)
│   └── utils/        # Utilitats (càlcul quotes)
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/  # Components reutilitzables
│   │   ├── pages/       # Pàgines de l'app
│   │   └── utils/       # API client, context
│   └── dist/         # Build de producció
└── RESUM_OPERATIU.md # Aquest document
```

---

## 🎯 CONCLUSIÓ

✅ **Sistema completament funcional i desplegat**
✅ **Cost actual: 0 €**
✅ **Suporta fins a 1000+ usuaris amb el pla gratuït**
✅ **Desplegament automàtic amb GitHub**
⚠️ **Acció requerida: Migrar PostgreSQL abans del 9/1/2026**

Per qualsevol dubte o problema, consulta els logs de Vercel/Render o revisa aquest document.

---

**Última actualització:** 10 de desembre de 2024
**Estat del sistema:** 🟢 Operatiu
