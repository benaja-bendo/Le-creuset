# CLAUDE.md — La Grenaille · Frontend

SPA React 19 + Vite + Tailwind 4 de **La Grenaille**, fonderie de bijoux.
Documentation détaillée : [`docs/`](docs/README.md). Démarrage rapide : [`README.md`](README.md). Déploiement : [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Le contexte en 30 secondes

La Grenaille fond des bijoux pour des professionnels. Ses clients lui **confient du métal précieux**, d'où le concept central de **compte poids** : un solde en grammes d'or fin, d'argent fin ou de platine, crédité au dépôt, débité à la fonte. Un solde négatif = le client doit du métal à la fonderie.

Ce n'est **pas** une boutique en ligne : les commandes se passent par email à `contact@lagrenaille.fr`. L'app sert à consulter son compte poids, suivre ses commandes, récupérer ses factures et sa bibliothèque de moules et de STL.

## Ce repo n'est qu'un tiers du projet

Trois dépôts git **indépendants**, côte à côte dans un dossier parent non versionné :

| Repo | Rôle | Branche |
|---|---|---|
| `Le-creuset` (**ici**) | SPA React | `develop` |
| `Le-creuset-backend` | API NestJS + Prisma | `develop` |
| `vps_infra` | Provisionnement VPS (Ansible) | `main` |

**Aucun commit transverse n'est possible.** Une fonctionnalité full-stack = 2 commits, 2 PR, 2 pipelines — et le **back se déploie en premier** quand il introduit un endpoint ou un champ.

Le modèle de données et les règles métier sont documentés côté back (`Le-creuset-backend/docs/01-domaine-metier.md`) ; une version condensée pour le front est dans [`docs/01-domaine-metier.md`](docs/01-domaine-metier.md).

## Une seule SPA, trois publics

| Zone | Préfixe | Layout | Accès |
|---|---|---|---|
| Vitrine publique | `/`, `/services`, `/fonte`… | `PublicLayout` | libre |
| Pages légales | `/legal/*` | `LegalLayout` | libre |
| Espace client | `/client/*` | `ClientLayout` | JWT requis |
| Back-office admin | `/client/admin/*` | `ClientLayout` | JWT + rôle `ADMIN` |

⚠️ **L'admin n'a pas de layout séparé.** Ses routes sont imbriquées **sous `/client`**, pas sous `/admin`, et `ClientLayout` bascule simplement son menu latéral selon le rôle.

## Où poser quoi

| Je veux… | Fichiers |
|---|---|
| ajouter une page | `src/pages/{public,client,admin}/` **+** la route dans `src/App.tsx` |
| changer la navigation | `src/layouts/ClientLayout.tsx` → `clientMenuItems` / `adminMenuItems` |
| appeler l'API | helpers de `src/api/client.ts` — **jamais de `fetch` brut** |
| afficher une commande | `orderRef()` / `orderStatusLabel()` de `src/lib/orders.ts` — **jamais l'`id` technique** |
| toucher à la session | `src/context/AuthContext.tsx`, garde dans `src/components/ProtectedRoute.tsx` |
| modifier un texte de service | **`src/App.tsx`** — le contenu de `/fonte`, `/impression`, `/moulage` est passé en props à `ServiceDetail` directement dans le routeur, pas dans le composant |
| toucher au rendu 3D | `src/components/STLViewer.tsx` |
| changer le thème | `src/index.css` — Tailwind v4, **il n'y a pas de `tailwind.config.js`** |

## Ajouter une route admin

```tsx
// dans les children de '/client', pas à la racine
{
  path: 'admin/ma-page',
  element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <MaPage />
    </ProtectedRoute>
  ),
}
```

## Conventions

- **Tailwind v4** via le plugin Vite `@tailwindcss/vite`. Thème déclaré en CSS dans `src/index.css`. Palettes `primary-*` (accent chaud) et `secondary-*` (gris/anthracite).
- Cartes : `bg-white rounded-xl border border-secondary-200 shadow-sm`. Fond des zones connectées : `bg-secondary-50`.
- Icônes **lucide-react** exclusivement — 14–18 px dans les tableaux, 40–48 px dans les états vides.
- **Français** pour tous les textes visibles. Dates via `toLocaleDateString('fr-FR')`.
- Pas de librairie de state ni de formulaire : `useState` par champ, `useEffect` au montage, `loading` / `error` locaux.
- Token JWT en `localStorage` sous la clé **`lagrenaille_token`**.
- Tableaux admin enveloppés dans `<div className="overflow-x-auto">`.
- **Une commande s'affiche toujours via `orderRef()`.** Un `id.slice(-6)` montré à l'utilisateur produit une référence qui ne correspond à aucune commande — c'est le bug que le client a signalé sur les factures.
- **Une liste qui grandit avec les données se plafonne** (hauteur max + `overflow-y-auto`), sinon la page s'allonge indéfiniment — cf. `WeightGauges.tsx`.
- **Le rendu 3D des métaux est calibré.** Dans `STLViewer.tsx`, `metalness: 0.9` et des albédos sombres compensent un pipeline volontairement sur-exposé. Éclaircir une couleur ou remonter `metalness` à 1.0 délave le métal en blanc.
- **Tout champ `Decimal` du schéma arrive en chaîne**, alors que les types front déclarent `number` — TypeScript ne détecte donc rien. `balance`, `estimatedPrice`, `amount`, `totalPrice`. Deux pièges : `0 + "120.5"` concatène, et `"12.5".toLocaleString('fr-FR', {…})` **ignore ses options** (`String` hérite de `Object.prototype.toLocaleString`). Passer par `formatGrams()` / `formatAmount()` / `toNumber()` de `src/lib/format.ts`.

## La couche API

```ts
import { getJSON, postJSON, patchJSON, deleteJSON, uploadFile, resolveUrl } from '@/api/client'
```

Ces helpers gèrent l'en-tête `Authorization`, la purge du token sur `401` et le décodage des erreurs Zod du back (`parseApiError` produit un message multi-ligne `champ: message`). `resolveUrl()` transforme une URL de fichier relative renvoyée par l'API en URL absolue.

> Deux `fetch` bruts subsistent dans `src/pages/admin/Invoices.tsx` et **ne testent pas `res.ok`** — une suppression refusée affiche un faux succès. À migrer vers `deleteJSON`.

## Pièges connus

- **`vite` est remplacé par `rolldown-vite`** via un `pnpm.overrides` dans `package.json`. Premier suspect si un plugin Vite se comporte mal.
- `pnpm build` fait `tsc -b && vite build` : **un import ou une variable inutilisée casse le build**. Nettoyer les imports en supprimant du code.
- `VITE_API_URL` doit inclure le suffixe **`/api`** (`http://localhost:3000/api`). Sans lui, tout part en 404.
- Le type `UserStatus` de `AuthContext.tsx` est `'PENDING' | 'ACTIVE' | 'REJECTED'` — **il manque `SUSPENDED`**, présent côté back.
- **Aucun composant `Modal` partagé** : 15 modales sont écrites en dur dans 11 fichiers, avec des overlays divergents.
- **Aucun test front**, d'aucune sorte.

## Dettes ouvertes

Détaillées dans [`docs/05-audit-retours-clients.md`](docs/05-audit-retours-clients.md). Les plus visibles : pas de composant `Modal` partagé, `admin/Orders.tsx` (722 l.) sans aucune classe responsive, et aucune adaptation mobile dans `STLViewer.tsx`.
