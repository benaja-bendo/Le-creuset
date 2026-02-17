# Optimisation : Utiliser une image de base plus légère et spécifique
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable

# Optimisation du cache : copier uniquement les fichiers de dépendances d'abord
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copier le reste des sources
COPY . .

# Build args pour injecter les variables d'environnement au moment du build (Vite en a besoin)
ARG VITE_API_URL
ARG VITE_DOMAIN_NAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME

# Construction de l'application
RUN pnpm build

# Stage de production
FROM nginx:1.27-alpine

# Copie de la configuration Nginx optimisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques générés
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Commande par défaut de l'image Nginx (pas besoin de la redéfinir sauf besoin spécifique)
CMD ["nginx", "-g", "daemon off;"]
