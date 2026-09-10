# 04 — Déploiement

Détails opérationnels (domaines, secrets) : [`DEPLOYMENT.md`](../DEPLOYMENT.md). Ce document décrit la **mécanique** et ses écarts par rapport à ce qui est documenté ailleurs.

## Environnements

| | Branche | URL front | API consommée |
|---|---|---|---|
| Production | `main` | `https://lagrenaille.fr` | `https://api.lagrenaille.fr` |
| Développement | `develop` | `https://dev.lagrenaille.fr` | `https://api.dev.lagrenaille.fr` |

## Chaîne réelle

```
push develop  ──►  deploy-dev.yml : lint + build          ← AUCUN déploiement
push main     ──►  deploy.yml : image Docker ──► ghcr.io ──► SSH VPS ──► compose up
```

> ⚠️ **Écart avec `DEPLOYMENT.md`.** Ce dernier décrit un environnement de dev déployé depuis `develop`, mais `.github/workflows/deploy-dev.yml` ne contient **qu'un seul job** (`checks`) : lint et build. Il ne construit ni ne pousse d'image, et ne se connecte à aucun serveur. Malgré son nom, il ne déploie rien. Soit l'environnement de dev est déployé à la main, soit le job a été retiré — à clarifier avant de s'y fier.

## CI — `develop`

`.github/workflows/deploy-dev.yml`, déclenché sur `push` et `pull_request` vers `develop`, plus `workflow_dispatch`.

Job `checks` : `pnpm install → lint → build`.

Rappel : `pnpm build` fait `tsc -b && vite build`. **Un import ou une variable inutilisée fait échouer la CI**, même si le code fonctionne en dev.

## CD — `main`

`.github/workflows/deploy.yml`, déclenché sur `push` vers `main` et `workflow_dispatch`. Deux jobs :

1. **`build-and-push`** — build Docker (Buildx), push vers **GitHub Container Registry** (`ghcr.io`), tags issus de `docker/metadata-action`.
2. **`deploy`** — prépare le dossier cible sur le VPS, y copie les fichiers de déploiement, puis se connecte en SSH pour tirer l'image et relancer la stack.

Secrets attendus : hôte, utilisateur et clé SSH du VPS, plus `VITE_API_URL` — qui est injectée **au build**, pas au runtime. Changer l'API cible impose donc de reconstruire l'image.

## Image

`Dockerfile` multi-stage : build Vite, puis **nginx** servant `dist/`.

La configuration nginx est dans [`nginx.conf`](../nginx.conf) : fallback SPA (toutes les routes renvoient `index.html` — indispensable pour `createBrowserRouter`) et compression gzip.

> Si une route directe comme `https://lagrenaille.fr/client/invoices` renvoie un 404 au lieu de l'app, c'est le fallback SPA de `nginx.conf` qu'il faut regarder.

## Fichiers de déploiement

```
Dockerfile                 image de production (build + nginx)
nginx.conf                 fallback SPA + gzip
docker-compose.prod.yml    stack de production
docker-compose.dev.yml     environnement de dev serveur
docker-compose.local.yml   dev local dockerisé
.deploy/                   fichiers copiés sur le VPS
.env.production            gabarit des variables de prod
DEPLOYMENT.md              domaines, secrets
```

## Livrer une fonctionnalité full-stack

Il n'y a pas de commit transverse entre ce repo et le back. L'ordre compte :

1. développer sur `develop` des deux côtés ;
2. **déployer le back en premier** s'il introduit un endpoint ou un champ ;
3. déployer le front ensuite ;
4. ne jamais consommer un champ d'API qui n'est pas encore en production — le front déployé taperait une API qui ne le renvoie pas.
