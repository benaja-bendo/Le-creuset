# Déploiement Frontend

Ce projet utilise une stratégie de déploiement séparée pour les environnements de **Développement** et de **Production**.

## Environnements

### 🟢 Production
- **Branche** : `main`
- **URL** : `https://lecreuset.benaja-bendo.fr`
- **API** : `https://api.lecreuset.benaja-bendo.fr`
- **Dossier VPS** : `/opt/apps/frontend-prod`
- **Workflow** : `.github/workflows/deploy-prod.yml`
- **Docker Compose** : `docker-compose.prod.yml`

### 🟡 Développement (Staging)
- **Branche** : `develop`
- **URL** : `https://dev.lecreuset.benaja-bendo.fr`
- **API** : `https://api.dev.lecreuset.benaja-bendo.fr`
- **Dossier VPS** : `/opt/apps/frontend-dev`
- **Workflow** : `.github/workflows/deploy-dev.yml`
- **Docker Compose** : `docker-compose.dev.yml`

## Développement Local

Pour travailler localement avec le hot-reload :

```bash
# Lancer en mode dev
docker compose -f docker-compose.local.yml up
```
L'application sera accessible sur `http://localhost:5173`.

## Mise en place initiale

1. S'assurer que les secrets GitHub sont configurés :
   - `VPS_HOST`, `VPS_USER`, `VPS_KEY`, `VPS_PASSPHRASE`
2. Pousser sur la branche `develop` pour déclencher le premier déploiement de dev.
3. Pousser sur la branche `main` pour déclencher le déploiement de prod.

## Architecture

Le déploiement est géré par GitHub Actions qui :
1. Construit l'image Docker avec les variables d'environnement appropriées (API URL).
2. Pousse l'image sur GHCR (GitHub Container Registry).
3. Se connecte au VPS via SSH.
4. Crée/Met à jour le dossier de déploiement.
5. Génère le fichier `docker-compose.yml` adapté.
6. Lance le conteneur via Docker Compose.
7. Traefik (installé sur le VPS) détecte automatiquement le nouveau conteneur et configure le routing HTTPS.
