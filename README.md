# Fantasy Betting - Mini Copa del Rei

Sistema d'apostes fantasy per gestionar apostes entre jugadors d'una liga fantasy durant eliminatòries de copa.

## Característiques

### Sistema de Monedes
- Cada jugador comença amb 1.000 monedes
- Sense límit d'aposta (pot apostar totes les monedes)
- **Recompensa**: Quan arribes a 10.000 monedes, pots convertir-les en 10.000.000€ de pressupost fantasy

### Tipus d'Apostes
1. **Guanyador del duel**: Aposta qui passa l'eliminatòria
2. **Marge de victòria**: Guanyar per +5, +10 o +20 punts (multiplicadors x1.8, x2.5, x5.0)
3. **Over/Under**: Puntuació total del duel per sobre o sota d'una línia
4. **Combinades**: Encadena entre 2 i 4 apostes, es multipliquen les cuotes

### Càlcul de Cuotes
Les cuotes es calculen automàticament basant-se en:
- Posició a la lliga
- Mitjana de punts històrics de cada equip
- Favorit: cuota 1.20-1.80
- Outsider: cuota 1.80-4.00
- Igualats: ~1.85-1.95

### Horaris
- **Apostes obertes**: Fins divendres 20:59
- **Resolució**: Dimarts nit

## Tech Stack

### Backend
- Node.js + Express
- SQLite (development) / PostgreSQL (production)
- JWT per autenticació
- bcryptjs per passwords

### Frontend
- React 18
- React Router
- Vite
- Axios

## Instal·lació i Execució Local

### Prerequisits
- Node.js 18 o superior
- npm o yarn

### Backend

```bash
cd backend
npm install

# Copiar fitxer d'entorn
cp .env.example .env

# Editar .env i canviar JWT_SECRET

# Iniciar servidor
npm run dev
```

El backend estarà disponible a `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install

# Copiar fitxer d'entorn
cp .env.example .env

# Si el backend està en un altre domini, editar VITE_API_URL

# Iniciar aplicació
npm run dev
```

El frontend estarà disponible a `http://localhost:3000`

## Deployment

### Backend a Render

1. Crear compte a [Render](https://render.com)
2. Crear nou **Web Service**
3. Connectar repositori GitHub
4. Configurar:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `JWT_SECRET=<genera-un-secret-segur>`
     - `PORT=5000` (Render ho detecta automàticament)

5. Desplegar

### Frontend a Vercel

1. Crear compte a [Vercel](https://vercel.com)
2. Importar projecte
3. Configurar:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL=https://el-teu-backend.onrender.com/api`

4. Desplegar

### Alternatives gratuïtes

#### Backend
- **Railway**: Similar a Render
- **Fly.io**: També ofereix tier gratuït
- **Cyclic**: Especialitzat en Node.js

#### Frontend
- **Netlify**: Similar a Vercel
- **Cloudflare Pages**: Molt ràpid
- **GitHub Pages**: Per projectes estàtics

## Estructura del Projecte

```
fantasy-betting/
├── backend/
│   ├── config/
│   │   └── db.js              # Configuració base de dades
│   ├── data/
│   │   └── teams.js           # Dades dels equips
│   ├── models/                # (opcional per futures extensions)
│   ├── routes/
│   │   ├── auth.js            # Rutes d'autenticació
│   │   ├── bets.js            # Rutes d'apostes
│   │   ├── matches.js         # Rutes de partits
│   │   └── users.js           # Rutes d'usuaris
│   ├── utils/
│   │   └── oddsCalculator.js  # Càlcul automàtic de cuotes
│   ├── .env                   # Variables d'entorn (NO pujar a git)
│   ├── .env.example           # Exemple de variables
│   ├── package.json
│   └── server.js              # Servidor principal
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BetSlip.jsx    # Formulari d'apostes
│   │   │   ├── MatchCard.jsx  # Tarjeta de partit
│   │   │   └── Navbar.jsx     # Navegació
│   │   ├── pages/
│   │   │   ├── Admin.jsx      # Panell admin
│   │   │   ├── Home.jsx       # Pàgina principal
│   │   │   ├── Leaderboard.jsx # Rànking
│   │   │   ├── Login.jsx
│   │   │   ├── MyBets.jsx     # Les meves apostes
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   ├── api.js         # Client API
│   │   │   └── AuthContext.jsx # Context d'autenticació
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

##Ús de l'Aplicació

### Per Jugadors

1. **Registrar-se**: Crear compte amb username i password
2. **Veure partits disponibles**: A la pàgina principal
3. **Fer apostes**:
   - Seleccionar tipus d'aposta (guanyador, marge, over/under)
   - Escollir quantitat
   - Confirmar aposta
4. **Apostes combinades**:
   - Seleccionar entre 2-4 apostes de diferents partits
   - La cuota es multiplica automàticament
5. **Seguiment**: Veure apostes pendents i historial a "Les meves apostes"
6. **Rànking**: Consultar posició al leaderboard
7. **Cash-out**: Quan arribes a 10.000 monedes, convertir en pressupost fantasy

### Per Administradors

1. **Crear partits**:
   - Especificar equips (han d'existir a les dades històriques)
   - Definir ronda
   - Establir data límit d'apostes (divendres 20:59)

2. **Resoldre partits**:
   - Introduir puntuació final de cada equip
   - El sistema resol automàticament totes les apostes
   - Actualitza monedes dels guanyadors

3. **Gestionar usuaris**:
   - Ajustar monedes manualment si cal
   - Veure historial de transaccions

## API Endpoints

### Autenticació
- `POST /api/auth/register` - Registrar usuari
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Info usuari actual

### Partits
- `GET /api/matches` - Tots els partits
- `GET /api/matches/open` - Partits oberts per apostar
- `GET /api/matches/:id` - Detalls partit
- `POST /api/matches` - Crear partit (admin)
- `PUT /api/matches/:id/result` - Establir resultat (admin)

### Apostes
- `GET /api/bets/my` - Les meves apostes
- `GET /api/bets/my/parlays` - Les meves combinades
- `POST /api/bets` - Crear aposta simple
- `POST /api/bets/parlay` - Crear combinada

### Usuaris
- `GET /api/users/leaderboard` - Rànking públic
- `GET /api/users/me/transactions` - Historial transaccions
- `GET /api/users/:id` - Info usuari
- `POST /api/users/:id/cash-out` - Convertir monedes en pressupost
- `PUT /api/users/:id/coins` - Ajustar monedes (admin)

## Seguretat

- Passwords encriptats amb bcrypt
- Autenticació JWT
- Validació de totes les entrades
- Protecció contra apostes en propis partits
- Verificació de saldo abans d'apostar
- CORS configurat correctament

## Millores Futures

- [ ] Notificacions en temps real
- [ ] Estadístiques avançades per jugador
- [ ] Gràfics d'evolució de monedes
- [ ] Sistema de badges/achievements
- [ ] Chat entre jugadors
- [ ] Historial detallat de cada partit
- [ ] Export d'estadístiques a Excel
- [ ] Apostes en viu
- [ ] Sistema de referral

## Suport

Per qualsevol dubte o problema, contactar amb l'administrador del sistema.

## Llicència

MIT License - Ús privat per la liga fantasy.
