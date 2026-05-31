# Lagrenaille - Frontend

Application React pour la gestion des devis et commandes de Lagrenaille.

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Node.js (optionnel si utilisation de Docker)

### Lancement Local
```bash
# Copier les variables d'environnement
cp .env.example .env

# Lancer le serveur de développement
docker compose -f docker-compose.local.yml up
```
Accès : [http://localhost:5173](http://localhost:5173)

## 🌍 Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour les détails complets.

- **Dev** : `https://dev.lagrenaille.fr` (Branche `develop`)
- **Prod** : `https://lagrenaille.fr` (Branche `main`)

## 🛠 Tech Stack
- **Framework** : React + Vite
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Container** : Docker (Nginx)
- **CI/CD** : GitHub Actions
