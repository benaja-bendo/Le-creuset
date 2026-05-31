# Étape 1 : Build de l'application React/Vite (build)
# Construit les fichiers statiques de l'application avec Node.js
FROM node:22-alpine AS build
WORKDIR /app

# On utilise corepack pour installer la version exacte de pnpm nécessaire pour le lockfile
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

# Optimisation du cache : on copie d'abord uniquement les dépendances
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copie du reste des sources
COPY . .

# Build args pour injecter les variables d'environnement au moment du build
ARG VITE_API_URL
ARG VITE_DOMAIN_NAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME

# Construction de l'application
RUN pnpm build

# Étape 2 : Image de production (serveur web Nginx)
# Image ultra-légère pour servir les fichiers statiques générés
FROM nginx:1.27-alpine

# Copie de la configuration Nginx optimisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques depuis l'étape de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Démarrage du serveur Nginx
CMD ["nginx", "-g", "daemon off;"]
