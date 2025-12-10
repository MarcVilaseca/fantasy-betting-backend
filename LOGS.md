# LOGS - Fantasy Betting Project

## 📍 UBICACIÓ DEL PROJECTE
**Nova ubicació:** `C:\Users\marcv\OneDrive\fantasy\fantasy-betting`
**Ubicació anterior:** `C:\Users\marcv\fantasy-betting` (ja obsoleta)

---

## 🎯 ESTAT ACTUAL DEL PROJECTE (10/12/2024)

### ✅ COMPLETAT
1. **Backend desplegat a Render i funcionant** 🟢
   - URL Backend: https://fantasy-betting-backend-XXXX.onrender.com
   - PostgreSQL connectada i funcionant
   - Base de dades inicialitzada correctament
   - Estat: **LIVE**

2. **Base de dades PostgreSQL a Render**
   - Hostname: dpg-d4shvrmmcj7s73c0oll0-a
   - Database: fantasy_betting_db
   - User: fantasy_betting_db_user
   - Tipus: Free tier
   - Expira: 9 de gener de 2026 (cal actualitzar a paid o renovar)

3. **Codi pujat a GitHub**
   - Repository: fantasy-betting (assumint que tens un repo)
   - Branch principal: main/master

### ⏳ PENDENT
1. **Desplegar Frontend a Vercel**
   - Hem decidit usar Vercel (millor que Render per frontends React/Vite)
   - Cal configurar VITE_API_URL amb la URL del backend de Render

---

## 🔧 FUNCIONALITATS IMPLEMENTADES

### Backend Features
1. ✅ Sistema d'autenticació JWT
2. ✅ Gestió de partits (crear, actualitzar, resultats)
3. ✅ Sistema d'apostes simples
4. ✅ Sistema d'apostes combinades (parlay - 2 a 4 apostes)
5. ✅ **Apostes públiques** - Tots els usuaris poden veure les apostes dels altres
6. ✅ **Cancel·lació d'apostes** - Amb retorn de monedes
7. ✅ **Cancel·lació d'apostes combinades** - Amb retorn de monedes
8. ✅ **Bloqueig temporal d'apostes** - Bloqueig a les 20:59 del 12/12/2025
9. ✅ Sistema de transaccions
10. ✅ **Classificació Fantasy** - Sistema independent de puntuació per jornades
11. ✅ Càlcul de quotes realista (betting house logic)
12. ✅ Verificació: els jugadors no poden apostar en els seus propis partits

### Frontend Features
1. ✅ Dashboard amb partits oberts
2. ✅ Pàgina de les meves apostes
3. ✅ **Pàgina d'apostes públiques** - Veure apostes de tots els clubs
4. ✅ **Pàgina de classificació fantasy** - Taula de classificació general
5. ✅ Sistema de parlay/combinades
6. ✅ **Botons de cancel·lar apostes** - Per apostes simples i combinades
7. ✅ Historial de transaccions
8. ✅ Leaderboard
9. ✅ Panel d'administració (crear partits, posar resultats, afegir punts fantasy)

---

## 📊 ESTRUCTURA DE LA BASE DE DADES (PostgreSQL)

### Taules principals:
1. **users** - Usuaris amb monedes, passwords (bcrypt), is_admin
2. **matches** - Partits amb team1, team2, round, status, scores, betting_closes_at
3. **bets** - Apostes individuals (amount 0 si són part d'una combinada)
4. **parlay_bets** - Apostes combinades
5. **parlay_bet_items** - Relació entre parlays i bets individuals
6. **transactions** - Historial de transaccions (apostes, guanys, reemborsaments)
7. **fantasy_scores** - Puntuacions fantasy per equip i jornada

---

## 🔑 CONFIGURACIONS IMPORTANTS

### Variables d'entorn Backend (Render)
```
DATABASE_URL=postgresql://fantasy_betting_db_user:PASSWORD@dpg-d4shvrmmcj7s73c0oll0-a/fantasy_betting_db
JWT_SECRET=(el que tinguis configurat)
NODE_ENV=production
```

### Variables d'entorn Frontend (Vercel - PENDENT)
```
VITE_API_URL=https://fantasy-betting-backend-XXXX.onrender.com/api
```

### Base de dades local (desenvolupament)
```
postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting
```

---

## 🚀 MIGRACIÓ REALITZADA

### De SQLite a PostgreSQL (9-10/12/2024)
**Raó:** Render no suporta SQLite persistent en el tier gratuït

**Canvis realitzats:**
1. Instal·lat `pg` package
2. Reescrit completament `backend/config/db.js`:
   - De `sqlite3` a `pg.Pool`
   - Canviat placeholders de `?` a `$1, $2, etc.`
   - Canviat tipus de dades:
     - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
     - `DATETIME DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
     - `REAL` → `NUMERIC(10,2)`
   - Afegit suport per SSL en producció
   - Utilitzat `ON CONFLICT` per upserts (fantasy_scores)
3. Afegit lògica de connexió:
   - Local: `postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting`
   - Producció: `process.env.DATABASE_URL` (de Render)

---

## 📝 RUTES DE L'API

### Auth
- `POST /api/auth/register` - Registre
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Info usuari actual

### Matches
- `GET /api/matches` - Tots els partits
- `GET /api/matches/open` - Partits oberts
- `GET /api/matches/:id` - Detall partit
- `GET /api/matches/teams` - Llista d'equips
- `POST /api/matches` - Crear partit (admin)
- `PUT /api/matches/:id/result` - Posar resultat (admin)
- `GET /api/matches/:id/bets` - Apostes d'un partit

### Bets
- `GET /api/bets/my` - Les meves apostes
- `GET /api/bets/my/parlays` - Les meves combinades
- `GET /api/bets/public` - **NOVA** - Apostes públiques de tots
- `POST /api/bets` - Crear aposta simple
- `POST /api/bets/parlay` - Crear combinada
- `DELETE /api/bets/:id` - **NOVA** - Cancel·lar aposta simple
- `DELETE /api/bets/parlay/:id` - **NOVA** - Cancel·lar combinada
- `GET /api/bets/:id` - Detall aposta

### Users
- `GET /api/users` - Tots els usuaris
- `GET /api/users/leaderboard` - Classificació per monedes
- `GET /api/users/me/transactions` - Les meves transaccions
- `POST /api/users/:id/cash-out` - Cash out (admin)
- `PUT /api/users/:id/coins` - Actualitzar monedes (admin)

### Fantasy
- `GET /api/fantasy/classification` - **NOVA** - Classificació general
- `GET /api/fantasy/matchdays/:matchday` - Puntuacions d'una jornada
- `GET /api/fantasy/all` - Totes les puntuacions
- `GET /api/fantasy/team/:team` - Historial d'un equip
- `POST /api/fantasy/scores` - Afegir puntuacions (admin)

---

## 🛠 COM EXECUTAR LOCALMENT

### Backend (PostgreSQL local)
```bash
cd C:\Users\marcv\OneDrive\fantasy\fantasy-betting\backend
npm install
npm start
# Corre a http://localhost:5000
```

### Frontend
```bash
cd C:\Users\marcv\OneDrive\fantasy\fantasy-betting\frontend
npm install
npm run dev
# Corre a http://localhost:5173
```

---

## 🐛 PROBLEMES RESOLTS

1. **ECONNREFUSED al desplegar a Render**
   - **Solució:** Crear PostgreSQL database a Render i afegir DATABASE_URL a les variables d'entorn

2. **Error en PublicBets i FantasyClassification**
   - **Causa:** Usaven `fetch()` directe sense autenticació
   - **Solució:** Canviat a `betsApi.getPublic()` i `fantasyApi.getClassification()`

3. **No es podia cancel·lar apostes combinades**
   - **Solució:** Afegida ruta `DELETE /api/bets/parlay/:id`

---

## 📅 PROPERES TASQUES

1. **Desplegar Frontend a Vercel**
   - Crear compte a Vercel
   - Connectar amb GitHub
   - Configurar VITE_API_URL
   - Desplegar

2. **Testing**
   - Provar totes les funcionalitats en producció
   - Verificar que les apostes funcionen correctament
   - Comprovar cancel·lació d'apostes
   - Verificar bloqueig temporal (20:59 12/12/2025)

3. **Futur (opcional)**
   - Afegir notificacions en temps real
   - Sistema de xat entre usuaris
   - Estadístiques avançades
   - Responsive design millores

---

## 🔐 CREDENCIALS

### PostgreSQL Local
- Host: localhost
- Port: 5432
- Database: fantasy_betting
- User: postgres
- Password: Disbauxa2001

### Render PostgreSQL
- Hostname: dpg-d4shvrmmcj7s73c0oll0-a
- Database: fantasy_betting_db
- User: fantasy_betting_db_user
- Password: [veure a Render dashboard]
- Internal URL: [copiat a DATABASE_URL]

---

## 📚 DOCUMENTACIÓ ADDICIONAL

- `README.md` - Documentació principal del projecte
- `QUICKSTART.md` - Guia ràpida d'inici
- `API_EXAMPLES.md` - Exemples de crides a l'API
- `Reglas de apuestas.pdf` - Regles del sistema d'apostes

---

**Última actualització:** 10 de desembre de 2024, 08:35
**Estat:** Backend desplegat ✅ | Frontend pendent de desplegament ⏳
