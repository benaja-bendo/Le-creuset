# Frontend – Espace Client Pro

Application React + TypeScript + Vite pour l’espace professionnel (devis STL, commandes, documents).

## Prérequis
- Node.js 18+ et pnpm
- API backend démarrée sur http://localhost:3000/api

## Démarrer en local
```bash
pnpm install
pnpm dev
```
Ouvrir http://localhost:5173/

## Configuration
- VITE_API_URL: URL de l’API (par défaut http://localhost:3000/api)
- BASE_URL: géré par Vite, base de déploiement (vite.config.ts)

## Routes principales
- Public: `/`, `/services`, `/login`, `/register`, `/contact`, `/legal/*`
- Client: `/client` (dashboard), `/client/quote`, `/client/orders`, `/client/settings`

Accès au client sécurisé:
- Non connecté → redirection vers `/login`
- Statut `PENDING` → accès bloqué avec message explicite

## Authentification
- Connexion: POST `/auth/login` → stocke un token local et met à jour le user
- Inscription: POST `/auth/register` → crée un compte `PENDING`, email à l’admin

## Design
- Formulaires pro (labels, aides, placeholders)
- Réactivité et accessibilité (focus, contrastes)

## Build
```bash
pnpm build
```
Le `base` de déploiement est défini dans `vite.config.ts` (par défaut `/Le-creuset/` en build).
