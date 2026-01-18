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
- Admin: `/client/admin/users` (validation comptes), `/client/admin/weights` (placeholder)

Accès au client sécurisé:
- Non connecté → redirection vers `/login`
- Statut `PENDING` → accès bloqué avec message explicite
- Statut `REJECTED` → message de refus et aucune fonctionnalité accessible

## Authentification
- Connexion: POST `/auth/login` → accepte `PENDING`, refuse `REJECTED`, token local + user
- Inscription: POST `/auth/register` → crée un compte `PENDING`, email à l’admin
- Déconnexion: bouton dans l’espace client → appel `POST /auth/logout`, nettoyage local et redirection `/login`

## Design
- Formulaires pro (labels, aides, placeholders)
- Réactivité et accessibilité (focus, contrastes)

## Build
```bash
pnpm build
```
Le `base` de déploiement est défini dans `vite.config.ts` (par défaut `/Le-creuset/` en build).
