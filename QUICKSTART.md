# Guia Ràpida d'Inici

## Pas 1: Instal·lar dependències

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Pas 2: Configurar entorns

### Backend
```bash
cd backend
# El fitxer .env ja està creat, però assegura't que JWT_SECRET és únic
```

### Frontend
```bash
cd frontend
# Crear fitxer .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

## Pas 3: Inicialitzar base de dades i crear admin

```bash
cd backend
npm run init-admin
```

Això crearà:
- Base de dades SQLite
- Usuari admin amb credencials:
  - Username: `admin`
  - Password: `admin123`

⚠️ **IMPORTANT**: Canvia aquesta contrasenya després del primer login!

## Pas 4: Iniciar aplicació

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend disponible a: `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend disponible a: `http://localhost:3000`

## Pas 5: Primer ús

1. **Accedeix a** `http://localhost:3000`
2. **Registra't** com a usuari normal
3. **Login amb admin**:
   - Username: `admin`
   - Password: `admin123`
4. **Crea el primer partit** (Panel Admin):
   - Equip 1: Escull un dels equips de la llista
   - Equip 2: Escull un altre equip
   - Ronda: "Vuitens de final"
   - Tancament: Divendres proper a les 20:59
5. **Fes la primera aposta** amb el teu usuari normal
6. **Resol el partit** amb l'admin quan acabin les jornades

## Equips disponibles

Els equips han de correspondre exactament amb aquests noms (dades històriques):

- Jaume Creixell U.E.
- L'ESQUADRA VILAS...
- CE FerranitoPito
- Nottingham_Pressa
- AstoNitu F.C
- Ruizinho F. C.
- Laminyamal T'FC
- SANCOTS 304
- pepe rubianes
- ArnauBabau F.C
- jaaavichu05
- Ao Tat Kha FC
- Catllaneta
- Babycots F.C

## Verificar que funciona

### Test API
```bash
curl http://localhost:5000/api/health
```

Hauria de retornar:
```json
{"status":"ok","message":"Fantasy Betting API is running"}
```

### Test Frontend
Obre `http://localhost:3000` al navegador

## Problemes comuns

### Error "Cannot find module"
```bash
# Reinstal·lar dependències
cd backend && npm install
cd frontend && npm install
```

### Port 5000 ja en ús
Canvia el port al fitxer `backend/.env`:
```
PORT=5001
```

I actualitza `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

### Base de dades no es crea
```bash
cd backend
rm fantasy-betting.db
npm run init-admin
```

## Següents passos

1. Canvia la contrasenya de l'admin
2. Convida altres jugadors a registrar-se
3. Crea els duels de la copa
4. Comença a apostar!

Per més informació, consulta el [README.md](README.md) complet.
