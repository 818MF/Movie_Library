# Favorite Movies API

API REST Node.js / Express pour gérer des films favoris : authentification JWT, MongoDB, recherche via [TMDB](https://www.themoviedb.org/), interface web (`index.html` + dossier `public/`).

---

## Sommaire

1. [Prérequis](#prérequis)  
2. [Installation](#installation)  
3. [Configuration (`.env`)](#configuration-env)  
4. [Lancement](#lancement)  
5. [Référence API](#référence-api)  
6. [Tests](#tests)  
7. [Déploiement Vercel](#déploiement-vercel)  
8. [Structure utile du dépôt](#structure-utile-du-dépôt)

---

## Prérequis

| Élément | Détail |
|--------|--------|
| Node.js | version **18** ou supérieure |
| MongoDB | instance locale **ou** [MongoDB Atlas](https://www.mongodb.com/atlas) (URI `mongodb+srv://…`) |
| TMDB | clé API ([paramètres TMDB](https://www.themoviedb.org/settings/api)) |
| RabbitMQ | **optionnel** — uniquement si `ENABLE_RABBITMQ=true` |

---

## Installation

```bash
git clone <url-du-depot>
cd Projet_nodeJS
npm install
```

Créez un fichier **`.env`** à la racine (voir section suivante). Ce fichier ne doit **pas** être versionné (déjà listé dans `.gitignore`).

---

## Configuration (`.env`)

### Obligatoire en usage normal

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Chaîne de connexion MongoDB (`mongodb://…` en local ou `mongodb+srv://…` sur Atlas). **Alias accepté :** `MONGO_URI` si `MONGODB_URI` est absent. |
| `JWT_SECRET` | Secret long et aléatoire pour signer les JWT. |
| `TMDB_API_KEY` | Clé API The Movie Database. |

### Optionnel / développement

| Variable | Défaut / exemple | Description |
|----------|-------------------|---------------|
| `PORT` | `3000` | Port HTTP en local. |
| `HOST` | `0.0.0.0` | Interface d’écoute. |
| `ENABLE_MONGODB` | `true` | Mettre `false` pour désactiver MongoDB (démo sans base). |
| `ENABLE_RABBITMQ` | `false` | Mettre `true` uniquement si RabbitMQ est installé et configuré. |
| `RABBITMQ_URL` | `amqp://localhost:5672` | URL AMQP si RabbitMQ est activé. |

### Exemples d’URI MongoDB

- **Local :** `mongodb://127.0.0.1:27017/favorite-movies`
- **Atlas :** `mongodb+srv://USER:PASS@cluster…mongodb.net/NOM_BASE?retryWrites=true&w=majority&appName=…`  
  Remplacez `NOM_BASE` (ex. `favorite-movies`) et ouvrez l’accès réseau dans Atlas (IP autorisées ou `0.0.0.0/0` pour des tests).

---

## Lancement

| Commande | Usage |
|------------|--------|
| `npm run dev` | Développement avec rechargement (nodemon). |
| `npm start` | Démarrage production (`node index.js`). |

En local, ouvrez par exemple **http://127.0.0.1:3002/** si `PORT=3002`.  
Vérification serveur : **GET** `/health` (JSON avec `ok`, `service`, `time`).

---

## Référence API

Toutes les routes sous `/api/movies` exigent un en-tête :  
`Authorization: Bearer <token>` (sauf mention contraire).

### Authentification — `/api/auth`

| Méthode | Chemin | Auth | Rôle |
|---------|--------|------|------|
| POST | `/api/auth/register` | Non | Inscription |
| POST | `/api/auth/login` | Non | Connexion |
| POST | `/api/auth/logout` | Bearer | Déconnexion (révoque le token) |

### Films favoris — `/api/movies`

| Méthode | Chemin | Auth | Rôle |
|---------|--------|------|------|
| GET | `/api/movies/search?query=` | Bearer | Recherche TMDB |
| GET | `/api/movies` | Bearer | Liste des favoris |
| POST | `/api/movies` | Bearer | Ajouter (ex. `tmdbId`, `rating`, `personalNote`) |
| PUT | `/api/movies/:id` | Bearer | Mettre à jour note / note perso |
| DELETE | `/api/movies/:id` | Bearer | Retirer des favoris |

---

## Tests

Le fichier **`api.rest`** (extension [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) pour VS Code / Cursor) contient des requêtes d’exemple. Définissez `@baseUrl` et `@authToken` en tête de fichier selon votre environnement.

---

## Déploiement Vercel

1. Importer le dépôt sur [vercel.com](https://vercel.com) et lier le projet Git.
2. Dans **Settings → Environment Variables**, définir au minimum :  
   `MONGODB_URI` (Atlas, pas `localhost`), `JWT_SECRET`, `TMDB_API_KEY`.  
   Conserver **`ENABLE_RABBITMQ=false`** sauf besoin avancé (serverless).
3. Les variables **`PORT`** et **`HOST`** sont gérées par Vercel — optionnelles en production.
4. Après déploiement : l’URL Vercel sert l’interface (`/`), l’API (`/api/...`) et `/health`.
5. Les assets (`/styles.css`, `/app.js`, images) sont servis depuis la racine pour coller au dossier `public/` sur Vercel.

Fichiers liés au déploiement : **`vercel.json`**, **`api/index.js`** (handler serverless), **`app.js`** (application Express sans `listen`).

---

## Structure utile du dépôt

| Chemin | Rôle |
|--------|------|
| `index.js` | Point d’entrée local : MongoDB, RabbitMQ optionnel, `app.listen`. |
| `app.js` | Application Express (routes, static, erreurs). |
| `api/index.js` | Entrée Vercel : connexion Mongo puis dispatch vers `app`. |
| `config/` | `rabbitmq.js`, `mongoUri.js` (résolution `MONGODB_URI` / `MONGO_URI`). |
| `services/user/` | Modèle utilisateur, routes auth, middleware JWT. |
| `services/movie/` | Modèle film, routes, client TMDB. |
| `public/` | CSS, JS front, images, `api-info.html`. |
| `index.html` | Page principale de l’interface. |
| `api.rest` | Requêtes de test HTTP. |
