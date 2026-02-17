# Le Creuset - Frontend

Application React + TypeScript gérant l'interface utilisateur (Espace Client et Administration).

## Développement Local

1.  Installer les dépendances :
    ```bash
    pnpm install
    ```
2.  Lancer le serveur de développement :
    ```bash
    pnpm dev
    ```

## Architecture de Déploiement

Le déploiement est entièrement automatisé via **GitHub Actions**.

### Pipeline CI/CD (`.github/workflows/deploy.yml`)

À chaque `push` sur la branche `main` :

1.  **Build** : L'image Docker est construite en utilisant un Dockerfile multi-stage (Node pour le build -> Nginx Alpine pour le run).
2.  **Push** : L'image est poussée sur le registre de conteneurs GitHub (GHCR).
3.  **Deploy** :
    *   Connexion SSH au VPS de production.
    *   Authentification auprès de GHCR.
    *   Pull de la nouvelle image (`docker compose pull front`).
    *   Redémarrage du conteneur sans interruption de service (`docker compose up -d front`).

### Configuration Production

*   **Serveur Web** : Nginx (via l'image Docker).
*   **Routing** : Géré par Traefik (sur le VPS) qui redirige le trafic vers ce conteneur.
*   **Variables d'environnement** : Injectées lors du build (ex: `VITE_API_URL`).
     *   `VITE_API_URL` : URL de l'API backend (ex: `http://localhost:3000`).
     *   `VITE_DOMAIN_NAME` : Nom de domaine de l'application (ex: `le-creuset.fr`).
 *   `VPS_HOST` : Adresse IP du VPS (ex: `128.65.195.180`).
 *   `VPS_USER` : Utilisateur SSH sur le VPS (ex: `root`).
 *   `VPS_KEY` : Clé SSH privée pour l'authentification (`cat ~/.ssh/id_rsa`).
 *   `VPS_PASSPHRASE` : Phrase de passe de la clé SSH privée (ex: `123456`).
 *   `VITE_VPS_DOMAIN_NAME` : Nom de domaine du VPS (ex: `dev.lagrenaille.fr`).

## Ajouter des variables d'environnement

Si vous ajoutez une nouvelle variable dans `.env` :
1.  Ajoutez-la dans le `Dockerfile` (section `ARG` et `ENV`).
2.  Si c'est un secret, ajoutez-la dans les `Secrets` du dépôt GitHub.

### Lancer le contenaire de production localement

1.  Assurez-vous d'avoir les variables d'environnement nécessaires dans votre fichier `.env`.
2.  Lancer le conteneur :
    ```bash
    docker compose up -d --build
    ```
