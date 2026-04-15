# Favorite Movies API

API Node/Express + MongoDB, auth JWT, recherche TMDB, interface web (`index.html` + `public/`).

## Prérequis

- Node.js 18+
- MongoDB (local ou URI distante)
- Clé [TMDB](https://www.themoviedb.org/settings/api) (`TMDB_API_KEY`)
- (Optionnel) RabbitMQ si `ENABLE_RABBITMQ=true`

## Installation & lancement

```bash
npm install
```

Créer un `.env` à la racine (voir variables ci‑dessous), puis :

```bash
npm run dev
```

Ouvrir **http://127.0.0.1:3002/** (ou le `PORT` défini). Santé : **GET /health**.

## Variables d’environnement

| Variable | Exemple | Rôle |
|----------|---------|------|
| `PORT` | `3002` | Port HTTP |
| `HOST` | `0.0.0.0` | Écoute réseau |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/favorite-movies` | Base |
| `ENABLE_MONGODB` | `true` | Désactiver : `false` |
| `JWT_SECRET` | chaîne longue aléatoire | Signature JWT |
| `TMDB_API_KEY` | *votre clé* | TMDB |
| `ENABLE_RABBITMQ` | `false` | Files de notif. |
| `RABBITMQ_URL` | `amqp://localhost:5672` | Si RabbitMQ activé |

## Endpoints principaux

| Méthode | Chemin | Auth |
|---------|--------|------|
| POST | `/api/auth/register` | Non |
| POST | `/api/auth/login` | Non |
| POST | `/api/auth/logout` | Bearer |
| GET | `/api/movies/search?query=` | Bearer |
| GET | `/api/movies` | Bearer |
| POST | `/api/movies` | Bearer (body : `tmdbId`, etc.) |
| PUT | `/api/movies/:id` | Bearer |
| DELETE | `/api/movies/:id` | Bearer |

Tests rapides : fichier **`api.rest`** (extension REST Client).

## Déploiement sur Vercel

1. Créez un projet sur [Vercel](https://vercel.com) pointant vers ce dépôt Git.
2. **MongoDB** : utilisez une base accessible depuis Internet ([MongoDB Atlas](https://www.mongodb.com/atlas)) — pas `localhost`. Définissez `MONGODB_URI` dans **Settings → Environment Variables**.
3. Renseignez aussi `JWT_SECRET`, `TMDB_API_KEY`, et laissez **`ENABLE_RABBITMQ=false`** (RabbitMQ n’est pas adapté au serverless par défaut).
4. `PORT` / `HOST` sont gérés par Vercel — inutiles en production.
5. Fichiers utiles : **`app.js`** (application Express), **`api/index.js`** (handler serverless), **`vercel.json`** (réécriture des routes vers ce handler).

Après déploiement, l’URL Vercel sert l’UI (`/`), l’API (`/api/...`) et `/health`.
