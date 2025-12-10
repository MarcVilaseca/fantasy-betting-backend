# Exemples d'ús de l'API

## Autenticació

### Registrar nou usuari
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "marc", "password": "password123"}'
```

Resposta:
```json
{
  "message": "Usuari creat correctament",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "marc",
    "coins": 1000,
    "is_admin": false
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Obtenir info usuari actual
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Partits

### Obtenir partits oberts
```bash
curl http://localhost:5000/api/matches/open
```

Resposta:
```json
[
  {
    "id": 1,
    "team1": "Jaume Creixell U.E.",
    "team2": "CE FerranitoPito",
    "round": "Vuitens de final",
    "status": "open",
    "betting_closes_at": "2024-01-19T20:59:00.000Z",
    "betOptions": {
      "match": {
        "team1": {"name": "...", "odds": 1.65, "average": 73.57, "position": 1},
        "team2": {"name": "...", "odds": 2.15, "average": 71.07, "position": 3}
      },
      "margins": {...},
      "overUnder": {"line": 145, "overOdds": 1.85, "underOdds": 1.85}
    }
  }
]
```

### Crear partit (només admin)
```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "team1": "Jaume Creixell U.E.",
    "team2": "CE FerranitoPito",
    "round": "Vuitens de final",
    "betting_closes_at": "2024-01-19T20:59:00"
  }'
```

### Establir resultat (només admin)
```bash
curl -X PUT http://localhost:5000/api/matches/1/result \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "score_team1": 85,
    "score_team2": 78
  }'
```

## Apostes

### Crear aposta simple
```bash
curl -X POST http://localhost:5000/api/bets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "match_id": 1,
    "bet_type": "winner",
    "selection": "Jaume Creixell U.E.",
    "amount": 100,
    "odds": 1.65
  }'
```

Resposta:
```json
{
  "bet": {
    "id": 1,
    "user_id": 2,
    "match_id": 1,
    "bet_type": "winner",
    "selection": "Jaume Creixell U.E.",
    "amount": 100,
    "odds": 1.65,
    "potential_return": 165,
    "status": "pending"
  },
  "newBalance": 900
}
```

### Crear aposta combinada
```bash
curl -X POST http://localhost:5000/api/bets/parlay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "amount": 50,
    "bets": [
      {
        "match_id": 1,
        "bet_type": "winner",
        "selection": "Jaume Creixell U.E.",
        "odds": 1.65
      },
      {
        "match_id": 2,
        "bet_type": "over_under",
        "selection": "over:140",
        "odds": 1.85
      }
    ]
  }'
```

Resposta:
```json
{
  "parlay_id": 1,
  "total_odds": 3.05,
  "potential_return": 152.5,
  "newBalance": 850
}
```

### Les meves apostes
```bash
curl http://localhost:5000/api/bets/my \
  -H "Authorization: Bearer USER_TOKEN"
```

### Les meves combinades
```bash
curl http://localhost:5000/api/bets/my/parlays \
  -H "Authorization: Bearer USER_TOKEN"
```

## Usuaris

### Leaderboard (públic)
```bash
curl http://localhost:5000/api/users/leaderboard
```

Resposta:
```json
[
  {
    "username": "marc",
    "coins": 1250,
    "canCashOut": false
  },
  {
    "username": "anna",
    "coins": 850,
    "canCashOut": false
  }
]
```

### Historial de transaccions
```bash
curl http://localhost:5000/api/users/me/transactions \
  -H "Authorization: Bearer USER_TOKEN"
```

### Cash-out (convertir 10.000 monedes)
```bash
curl -X POST http://localhost:5000/api/users/2/cash-out \
  -H "Authorization: Bearer USER_TOKEN"
```

### Ajustar monedes (només admin)
```bash
curl -X PUT http://localhost:5000/api/users/2/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "coins": 1500,
    "reason": "Ajust per error en aposta"
  }'
```

## Tipus d'apostes

### 1. Guanyador
```json
{
  "match_id": 1,
  "bet_type": "winner",
  "selection": "Jaume Creixell U.E.",
  "odds": 1.65,
  "amount": 100
}
```

### 2. Marge de victòria
```json
{
  "match_id": 1,
  "bet_type": "margin",
  "selection": "Jaume Creixell U.E.:+10",
  "odds": 4.13,
  "amount": 50
}
```

Opcions:
- `+5` (x1.8)
- `+10` (x2.5)
- `+20` (x5.0)

### 3. Over/Under
```json
{
  "match_id": 1,
  "bet_type": "over_under",
  "selection": "over:145",
  "odds": 1.85,
  "amount": 75
}
```

o

```json
{
  "selection": "under:145"
}
```

## Errors comuns

### 401 Unauthorized
```json
{
  "error": "Token no proporcionat"
}
```
Solució: Afegir header `Authorization: Bearer YOUR_TOKEN`

### 403 Forbidden
```json
{
  "error": "No pots apostar en els teus propis partits"
}
```

### 400 Bad Request
```json
{
  "error": "No tens prou monedes"
}
```

### 404 Not Found
```json
{
  "error": "Partit no trobat"
}
```

## Testing amb Postman

1. Importa aquesta col·lecció a Postman
2. Crea una variable d'entorn `base_url` = `http://localhost:5000/api`
3. Després del login, guarda el token a una variable `token`
4. Afegeix el token als headers: `Authorization: Bearer {{token}}`
