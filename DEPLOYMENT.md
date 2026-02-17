# Déploiement Frontend - Lagrenaille.fr

Ce projet utilise une stratégie de déploiement séparée pour les environnements de **Développement** et de **Production**.

## Domaines

- **Production** : `https://lagrenaille.fr`
- **Développement** : `https://dev.lagrenaille.fr`

## Environnements

### 🟢 Production
- **Branche** : `main`
- **URL** : `https://lagrenaille.fr`
- **API** : `https://api.lagrenaille.fr`
- **Dossier VPS** : `/opt/apps/frontend-prod`
- **Workflow** : `.github/workflows/deploy-prod.yml`
- **Docker Compose** : `docker-compose.prod.yml`

### 🟡 Développement (Staging)
- **Branche** : `develop`
- **URL** : `https://dev.lagrenaille.fr`
- **API** : `https://api.dev.lagrenaille.fr`
- **Dossier VPS** : `/opt/apps/frontend-dev`
- **Workflow** : `.github/workflows/deploy-dev.yml`
- **Docker Compose** : `docker-compose.dev.yml`

## Développement Local

Pour travailler localement avec le hot-reload :

1. Copier le fichier d'exemple `.env.example` vers `.env` (si nécessaire) :
   ```bash
   cp .env.example .env
   ```

2. Lancer l'environnement Docker :
   ```bash
   docker compose -f docker-compose.local.yml up
   ```
   L'application sera accessible sur `http://localhost:5173`.

## Mise en place initiale

1. S'assurer que les secrets GitHub sont configurés :
   - `VPS_HOST`, `VPS_USER`, `VPS_KEY`, `VPS_PASSPHRASE`
2. Pousser sur la branche `develop` pour déclencher le premier déploiement de dev.
3. Pousser sur la branche `main` pour déclencher le déploiement de prod.

## Architecture & Bonnes Pratiques

### Docker
- **Build Multi-stage** : L'image Docker est construite en deux étapes (Node.js pour le build, Nginx pour le run) pour minimiser la taille finale (image basée sur Alpine Linux).
- **Nginx** : Configuré pour servir une SPA (Single Page Application) avec redirection vers `index.html` pour le routing côté client et headers de cache optimisés pour les assets.

### CI/CD
Le déploiement est géré par GitHub Actions qui :
1. Construit l'image Docker avec les variables d'environnement appropriées (`VITE_API_URL`, etc.).
2. Pousse l'image sur GHCR (GitHub Container Registry) avec un tag spécifique (`front-dev` ou `front-prod`).
3. Se connecte au VPS via SSH.
4. Crée/Met à jour le dossier de déploiement sécurisé `/opt/apps/...`.
5. Génère le fichier `docker-compose.yml` adapté à la volée.
6. Lance le conteneur via Docker Compose avec Traefik pour la gestion HTTPS automatique.
7. Nettoie les anciennes images Docker pour économiser de l'espace disque.
