# FANTASY BETTING - MINI COPA DEL REI
## Guia de Funcionalitats per a Companys

---

## QUÈ ÉS AQUESTA WEB?

Plataforma d'apostes fantasy per gestionar apostes entre els jugadors de la nostra liga fantasy durant les eliminatòries de copa. Cada jugador aposta monedes virtuals sobre els resultats dels duels de copa.

---

## FUNCIONALITATS PRINCIPALS

### 1. SISTEMA DE REGISTRE I LOGIN
- Cada jugador es registra amb un nom d'usuari i contrasenya
- Autenticació segura amb tokens JWT
- Cada jugador nou comença amb 1.000 monedes

### 2. PÀGINA PRINCIPAL - APOSTES
**Què es pot fer:**
- Veure tots els partits disponibles per apostar
- Veure les cuotes de cada aposta (calculades automàticament segons l'historial dels equips)
- Fer apostes simples o combinades
- Veure el teu saldo actual de monedes
- Veure el temps restant per apostar (fins divendres 20:59h)

**Tipus d'apostes disponibles:**

**A) Aposta Simple - Guanyador del Duel**
- Apostes sobre qui passarà l'eliminatòria
- Cuotes automàtiques basades en posició de lliga i historial

**B) Aposta per Marge de Victòria**
- Guanyar per +5 punts → multiplicador x1.8
- Guanyar per +10 punts → multiplicador x2.5
- Guanyar per +20 punts → multiplicador x5.0

**C) Over/Under - Puntuació Total**
- Apostar si la suma de punts dels dos equips serà per sobre o sota d'una línia
- Exemple: Over 180.5 punts totals

**D) Apostes Combinades (Parlays)**
- Combinar entre 2 i 4 apostes de diferents partits
- Les cuotes es multipliquen entre elles
- Exemple: 3 apostes amb cuotes 1.5, 2.0, 1.8 → Cuota final: 5.4x
- Si falla una aposta, es perd tota la combinada

### 3. LES MEVES APOSTES
**Què pots veure:**
- Totes les teves apostes pendents (partits no resolts)
- Historial complet d'apostes passades
- Apostes guanyades i perdudes
- Guanys i pèrdues de cada aposta
- Apostes combinades amb el seu estat detallat

**Informació de cada aposta:**
- Partit
- Tipus d'aposta
- Quantitat apostada
- Cuota
- Guany potencial
- Estat (pendent/guanyada/perduda)

### 4. APOSTES PÚBLIQUES
- Veure totes les apostes que han fet els altres jugadors
- Útil per veure les tendències i decisions dels altres
- Es pot veure: jugador, partit, tipus d'aposta, quantitat i cuota

### 5. LEADERBOARD (RÀNKING)
**Què mostra:**
- Classificació de tots els jugadors ordenats per monedes
- Saldo actual de cada jugador
- Nombre d'apostes guanyades
- Nombre d'apostes perdudes
- Taxa d'encert (%)
- ROI (Return on Investment) - rendibilitat de les apostes

**Indicador especial:**
- Si un jugador arriba a 10.000 monedes, pot convertir-les en 10.000.000€ de pressupost fantasy

### 6. CLASSIFICACIÓ FANTASY
- Consultar la classificació real de la liga fantasy
- Veure punts acumulats per jornada de cada equip
- Dades històriques que serveixen per calcular les cuotes
- Ajuda a prendre decisions informades sobre les apostes

### 7. PANELL D'ADMINISTRACIÓ (només admins)

**Crear Partits Nous:**
- Seleccionar els dos equips del duel
- Definir la ronda de copa (1/8, quarts, semis, final)
- Establir data límit d'apostes (per defecte divendres 20:59h)
- El sistema calcula automàticament les cuotes

**Resoldre Partits:**
- Introduir la puntuació final de cada equip
- El sistema automàticament:
  - Determina el guanyador
  - Resol totes les apostes (simples i combinades)
  - Actualitza les monedes dels jugadors
  - Marca el partit com a resolt

**Gestionar Usuaris:**
- Veure llista de tots els usuaris
- Ajustar monedes manualment si hi ha un error
- Veure historial de transaccions de cada usuari
- Convertir monedes en pressupost fantasy (cash-out)

**Veure Totes les Apostes:**
- Accés complet a totes les apostes de tots els jugadors
- Útil per revisar incidències o errors

---

## REGLES IMPORTANTS

### Horaris
- **Apostes obertes:** Des que es crea el partit fins divendres 20:59h
- **Resolució:** Dimarts a la nit (després que es coneguin els resultats reals)

### Límits d'Aposta
- **No hi ha límit màxim:** Pots apostar totes les teves monedes si vols
- **Límit mínim:** 1 moneda per aposta

### Cash-Out (Convertir Monedes)
- Quan arribes a **10.000 monedes**, pots convertir-les en **10.000.000€** de pressupost fantasy
- És opcional, pots seguir apostant per acumular més

### Apostes Combinades
- Mínim 2 apostes, màxim 4
- Han de ser de partits diferents
- Si falla UNA aposta, es perd TOT

---

## CÀLCUL AUTOMÀTIC DE CUOTES

El sistema calcula les cuotes automàticament basant-se en:

1. **Posició a la classificació fantasy**
2. **Mitjana de punts històrics** de cada equip
3. **Diferència entre equips**

**Exemples de cuotes:**
- Favorit clar: 1.20 - 1.50
- Favorit moderat: 1.50 - 1.80
- Partits igualats: 1.85 - 1.95
- Outsider: 1.80 - 4.00

---

## SEGURETAT

- Contrasenyes encriptades
- Tokens d'autenticació segurs
- Protecció contra apostes duplicades
- Verificació de saldo abans d'acceptar apostes
- Només admins poden crear/resoldre partits

---

## TECNOLOGIA UTILITZADA

**Frontend:**
- React 18 amb Vite
- Interfície responsive
- Hot reload per desenvolupament

**Backend:**
- Node.js + Express
- PostgreSQL (base de dades)
- API REST amb autenticació JWT

**Deployment:**
- Frontend i Backend desplegats per separat
- Variables d'entorn per configuració segura

---

## FLUX D'ÚS TÍPIC

### Per a un Jugador Normal:

1. **Registrar-se** a la plataforma
2. **Login** amb les teves credencials
3. **Revisar partits** disponibles a la pàgina principal
4. **Consultar classificació fantasy** per informar-te
5. **Fer apostes** simples o combinades
6. **Seguir apostes** a "Les meves apostes"
7. **Consultar rànking** per veure la teva posició
8. **Veure apostes públiques** per comparar amb altres jugadors
9. Quan el partit es resol, **rebre monedes** si guanyes
10. Quan arribes a 10.000 monedes, **convertir en pressupost fantasy**

### Per a un Administrador:

1. **Crear partit nou** abans de cada jornada de copa
2. **Esperar** que els jugadors facin apostes
3. Divendres 21:00h → **tancar apostes** (automàtic)
4. Dilluns després dels partits reals → **introduir resultats**
5. **El sistema resol automàticament** totes les apostes
6. **Revisar** si hi ha incidències o dubtes
7. **Ajustar monedes** manualment si cal (errors)

---

## PREGUNTES FREQÜENTS

**Puc cancel·lar una aposta?**
No, un cop confirmada no es pot cancel·lar.

**Què passa si em quedo sense monedes?**
L'admin pot afegir-te monedes manualment o esperar a la següent jornada.

**Puc apostar en múltiples opcions del mateix partit?**
Sí, pots fer vàries apostes diferents sobre el mateix partit.

**Com es calculen les apostes combinades?**
Es multipliquen totes les cuotes. Exemple: 1.5 x 2.0 x 1.8 = 5.4x

**Què passa si un partit es cancel·la?**
L'admin haurà de gestionar-ho manualment, retornant les apostes.

**Puc veure les apostes dels altres abans d'apostar?**
Sí, a la pàgina "Apostes Públiques".

---

## CONTACTE I SUPORT

Per qualsevol dubte, problema tècnic o error, contactar amb l'administrador del sistema.

---

**Data del document:** Desembre 2024
**Versió:** 1.0
