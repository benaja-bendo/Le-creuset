# Déploiement sur GitHub Pages

Ce guide explique comment déployer le site Le Creuset sur GitHub Pages.

## Prérequis

- Git configuré avec accès au repository `git@github.com:benaja-bendo/Le-creuset.git`
- Node.js et pnpm installés
- Toutes les dépendances installées (`pnpm install`)

## Configuration

### 1. Configuration de base

Le site est déjà configuré pour GitHub Pages avec :

- **Base path** : `/Le-creuset/` dans `vite.config.ts`
- **Scripts de déploiement** dans `package.json`
- **GitHub Actions workflow** dans `.github/workflows/deploy.yml`

### 2. Informations à mettre à jour

⚠️ **IMPORTANT** : Avant le déploiement, remplacez les informations placeholder dans :

#### `src/pages/public/MentionsLegales.tsx`
- `[NOM DE LA SOCIÉTÉ]`
- `[SIRET]`
- `[TVA]`
- `[ADRESSE COMPLÈTE]`
- etc.

#### `src/pages/public/PrivacyPolicy.tsx`
- Contact email
- Adresse de la société
- Numéro de téléphone

## Méthodes de déploiement

### Option A : Déploiement manuel

```bash
# 1. Builder le projet
pnpm build

# 2. Déployer sur GitHub Pages
pnpm deploy
```

Cette commande va :
1. Construire le site dans le dossier `dist/`
2. Pusher le contenu vers la branche `gh-pages`

### Option B : Déploiement automatique (recommandé)

Le déploiement automatique via GitHub Actions est configuré avec pnpm.

**Configuration GitHub Pages** :

1. **Aller dans Settings > Pages** de votre repository
2. **Source** : Sélectionner "GitHub Actions" (⚠️ Important)
3. **Sauvegarder**

À chaque push sur la branche `main`, le site sera automatiquement :
- Construit avec pnpm
- Déployé sur `https://benaja-bendo.github.io/Le-creuset/`

**Workflow** :
Le fichier `.github/workflows/deploy.yml` contient le pipeline CI/CD qui :
- S'exécute à chaque push sur `main`
- Installe les dépendances avec `pnpm`
- Build le projet
- Déploie sur GitHub Pages via l'action officielle

## Vérification post-déploiement

Après le déploiement, vérifiez :

### ✅ Checklist
- [ ] Le site est accessible à `https://benaja-bendo.github.io/Le-creuset/`
- [ ] Toutes les pages se chargent correctement
- [ ] Les assets (images, CSS, JS) se chargent
- [ ] La navigation fonctionne
- [ ] Les formulaires de contact/devis fonctionnent
- [ ] Les pages légales affichent les bonnes informations

### Pages à tester
- `/` - Accueil
- `/services` - Nos services
- `/fonte`, `/impression`, `/moulage` - Détails services
- `/quote` - Devis en ligne
- `/contact` - Contact
- `/legal/mentions-legales` - Mentions légales
- `/legal/cgv` - CGV
- `/legal/privacy` - Politique de confidentialité

## Résolution de problèmes

### Les assets ne se chargent pas
**Problème** : Images ou CSS manquants  
**Solution** : Vérifier que `base: '/Le-creuset/'` est bien dans `vite.config.ts`

### Page 404 sur les routes
**Problème** : Les routes directes (ex: `/services`) donnent 404  
**Solution** : Normal avec GitHub Pages, utiliser HashRouter ou créer un fichier `404.html` qui redirige vers `index.html`

### Le build échoue
**Problème** : Erreurs TypeScript ou de build  
**Solution** : Lancer `pnpm build` en local pour voir les erreurs

## Commandes utiles

```bash
# Development
pnpm dev              # Lancer le serveur de développement

# Build & Preview
pnpm build            # Construire pour la production
pnpm preview          # Prévisualiser le build local

# Déploiement
pnpm deploy           # Déployer manuellement sur GitHub Pages

# Maintenance
pnpm lint             # Vérifier le code
```

## Structure des branches

- **main** : Branche principale, déclenche le déploiement automatique
- **gh-pages** : Branche créée automatiquement, contient le site compilé

⚠️ Ne jamais modifier directement la branche `gh-pages`.

## URLs

- **Production** : https://benaja-bendo.github.io/Le-creuset/
- **Repository** : git@github.com:benaja-bendo/Le-creuset.git

## Support

Pour toute question sur le déploiement :
1. Vérifier les logs GitHub Actions
2. Consulter la documentation GitHub Pages
3. Vérifier que les permissions du workflow sont correctes (Settings > Actions > General)

---

**Dernière mise à jour** : ${new Date().toLocaleDateString('fr-FR')}
