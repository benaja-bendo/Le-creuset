# Documentation — Frontend La Grenaille

SPA React 19 + Vite + Tailwind 4 de **La Grenaille**, fonderie de bijoux.

Écrite le 9 août 2026 à partir d'une lecture du code réel. Guide opérationnel condensé : [`../CLAUDE.md`](../CLAUDE.md).

## Sommaire

| # | Document | Contenu |
|---|---|---|
| 01 | [Domaine métier](01-domaine-metier.md) | Architecture 3-repos + ce que le front doit savoir du métier |
| 02 | [Frontend](02-frontend.md) | Routing, layouts, couche API, conventions UI, composants |
| 03 | [Dev local](03-dev-local.md) | Démarrer, variables, pièges, recette manuelle |
| 04 | [Déploiement](04-deploiement.md) | CI/CD GitHub Actions, Docker/nginx |
| 05 | [Audit des retours clients](05-audit-retours-clients.md) | Ce qui est fait / partiel / à faire, côté front |

Voir aussi, à la racine du repo : [`README.md`](../README.md) (démarrage express) et [`DEPLOYMENT.md`](../DEPLOYMENT.md) (domaines, secrets).

## Périmètre

Cette documentation couvre **ce repo uniquement**. L'API vit dans le dépôt `Le-creuset-backend` et porte sa propre `docs/` :

| Sujet | Où |
|---|---|
| Routing, pages, composants, conventions UI | **ici** |
| Ce que le front doit savoir du métier | **ici**, en version condensée |
| Modèle de données complet, règles métier, cycles de vie | repo `Le-creuset-backend` → `docs/01-domaine-metier.md` — **source de vérité** |
| Carte des endpoints, auth, guards | repo `Le-creuset-backend` → `docs/02-api.md` |

> Si vous modifiez une règle métier documentée ici, reportez le changement côté back : `prisma/schema.prisma` et `docs/01-domaine-metier.md` font foi.

## Démarrage rapide

```bash
cp .env.example .env && pnpm install && pnpm dev
```

Front sur `http://localhost:5173`. L'API doit tourner en parallèle sur `http://localhost:3000/api` (voir le repo back).
