# 03 — Développement local

## Prérequis

- Node ≥ 20, **pnpm**
- L'API back qui tourne en parallèle (repo `Le-creuset-backend`) — sinon toutes les pages connectées restent vides.

## Démarrage

```bash
cp .env.example .env && pnpm install && pnpm dev
```

Front sur `http://localhost:5173`.

### Lancer l'API en parallèle

Depuis le repo back :

```bash
docker compose -f docker-compose.local.yml up -d && pnpm prisma:generate && pnpm start:dev
```

API sur `http://localhost:3000/api`.

## Variables d'environnement

| Variable | Rôle | Valeur locale |
|---|---|---|
| `VITE_API_URL` | base de l'API, **avec le suffixe `/api`** | `http://localhost:3000/api` |
| `VITE_DOMAIN_NAME` | domaine | `localhost` |

> `VITE_API_URL` **doit** inclure `/api`. `src/api/client.ts` en dérive `BASE_URL` (l'URL sans `/api`) pour résoudre les URL de fichiers. Sans le suffixe, tous les appels partent en 404 et les fichiers pointent sur la mauvaise racine.

## Pièges connus

| Symptôme | Cause | Solution |
|---|---|---|
| Tout part en 404 | `VITE_API_URL` sans `/api` | corriger le `.env` puis relancer `pnpm dev` (Vite ne recharge pas le `.env` à chaud) |
| 401 en boucle | token expiré ou invalide | `localStorage.removeItem('lagrenaille_token')` puis recharger |
| Erreur CORS | `CORS_ORIGIN` côté back | vérifier la variable dans le `.env` du back (`*` en local) |
| PDF / STL / photos cassés | URL relative mal résolue | passer par `resolveUrl()` de `src/api/client.ts` |
| `pnpm build` échoue sans erreur de bundle | `tsc -b` bloque sur un import ou une variable inutilisée | nettoyer les imports morts |
| Comportement Vite étrange | `vite` remplacé par `rolldown-vite` (`pnpm.overrides`) | vérifier la compatibilité du plugin concerné |
| Page blanche après login | rôle ou statut inattendu dans `ProtectedRoute` | inspecter la réponse de `GET /auth/me` |

## Créer des comptes de test

Il n'existe **pas de seed**. Pour un premier admin :

1. s'inscrire via `/register` → compte `PENDING`, redirection vers `/waiting-approval` ;
2. le promouvoir en base (depuis le repo back) :

```bash
docker exec -it lagrenaille-back psql -U root -d lagrenaille-db -c "UPDATE users SET status='ACTIVE', role='ADMIN' WHERE email='votre@email.fr';"
```

3. pour les comptes **clients** de test, passer ensuite par l'interface admin (*Utilisateurs → Valider*) : c'est ce qui déclenche la création des comptes poids. Un `UPDATE` SQL direct ne les crée pas.

## Tests

Il n'y a **aucun test front** — ni unitaire, ni composant, ni e2e. Les seules barrières automatiques sont :

```bash
pnpm lint
```

```bash
pnpm build
```

Les deux tournent en CI sur `develop`.

## Parcours de recette manuelle

Sans tests automatiques, l'aller-retour manuel sur les deux rôles est la seule vraie vérification :

1. **Inscription client** : `/register` avec KBIS + document douane → écran `/waiting-approval`.
2. **Validation admin** : *Utilisateurs* → valider → les 3 comptes poids sont créés.
3. **Crédit métal** : *Comptes Poids* → transaction `CREDIT` sur le compte or fin.
4. **Commande** : *Commandes* → création manuelle avec numéro suggéré → faire évoluer le statut.
5. **Clôture** : clôturer avec un PDF de facture et un débit poids → vérifier que le solde a bougé.
6. **Vue client** : se reconnecter en client → *Tableau de bord*, *Mon Compte Poids*, *Mes Commandes*, *Mes Factures*.
7. **Groupement** : créer 2 commandes, les grouper en une facture → **vérifier ce que le client voit** (aujourd'hui : rien, voir [l'audit](05-audit-retours-clients.md)).
8. **Bibliothèque** : déposer un STL et un moule côté admin → vérifier l'affichage et le viewer 3D côté client.
9. **Mobile** : refaire les étapes 6 à 8 en 375 px de large et sur un vrai téléphone — c'est là que se concentrent les problèmes connus (responsive admin, rendu STL).
