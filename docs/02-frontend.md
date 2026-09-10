# 02 — Frontend

SPA React 19 + Vite + Tailwind 4. Une seule application sert la vitrine publique, l'espace client et le back-office admin.

## Arborescence

```
src/
├── App.tsx             toutes les routes (createBrowserRouter)
├── main.tsx            point d'entrée
├── index.css           Tailwind + variables de thème
├── api/client.ts       couche HTTP unique
├── context/
│   └── AuthContext.tsx session, login/logout, restauration au boot
├── layouts/
│   ├── PublicLayout.tsx    vitrine
│   ├── LegalLayout.tsx     pages légales
│   └── ClientLayout.tsx    espace connecté (client ET admin)
├── components/
│   ├── ProtectedRoute.tsx  garde de route
│   ├── STLViewer.tsx       visualiseur 3D three.js
│   ├── ImageViewerModal.tsx
│   ├── WeightGauges.tsx    jauges de compte poids
│   ├── Alert.tsx
│   └── ui/tooltip.tsx      (Radix)
├── pages/
│   ├── public/    Home, Services, ServiceDetail, Contact, Login, Register,
│   │              ResetPassword, WaitingApproval, CGV, MentionsLegales,
│   │              PrivacyPolicy, Quote, ErrorPage
│   ├── client/    Dashboard, WeightAccount, Quote, Orders, OrderDetail,
│   │              MyInvoices, Molds, Profile
│   └── admin/     UsersPending, UserProfile, Weights, Orders, OrderDetail,
│                  Invoices, CreateInvoice, Library
└── assets/
```

## Routing

Tout est déclaré dans [`src/App.tsx`](../src/App.tsx), en un seul `createBrowserRouter`. Trois branches.

### Vitrine — `PublicLayout`
`/` · `/login` · `/register` · `/reset` · `/waiting-approval` · `/services` · `/fonte` · `/impression` · `/moulage` · `/contact`

Les trois pages de service réutilisent le composant `ServiceDetail` avec **le contenu éditorial passé en props directement dans `App.tsx`** (titre, description, image, liste de détails). Pour modifier un texte de service, c'est là qu'il faut aller — pas dans le composant.

### Légal — `LegalLayout`
`/legal/mentions-legales` · `/legal/cgv` · `/legal/privacy`

### Espace connecté — `ClientLayout`, sous `ProtectedRoute`

| Client | Admin |
|---|---|
| `/client` — Dashboard | `/client/admin/users` — validation des inscriptions |
| `/client/weight-account` | `/client/admin/users/:id` |
| `/client/quote` — Devis STL | `/client/admin/weights` |
| `/client/orders`, `/client/orders/:id` | `/client/admin/orders`, `/client/admin/orders/:id` |
| `/client/invoices` | `/client/admin/invoices` |
| `/client/molds` — Ma Bibliothèque | `/client/admin/invoices/new` — dépôt de facture |
| `/client/settings` | `/client/admin/library` |

> Les routes admin sont **imbriquées sous `/client`**, pas sous un préfixe `/admin`. Une nouvelle page admin va dans les `children` de `/client`, avec `path: 'admin/…'` et une double protection :

```tsx
{
  path: 'admin/ma-page',
  element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <MaPage />
    </ProtectedRoute>
  ),
}
```

## Authentification côté client

[`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) :

- au montage, si un token existe en `localStorage` (clé **`lagrenaille_token`**), appelle `GET /auth/me` pour restaurer la session ;
- expose `{ user, loading, login, logout }` via `useAuth()`.

[`src/components/ProtectedRoute.tsx`](../src/components/ProtectedRoute.tsx) applique dans cet ordre :

1. `loading` → spinner ;
2. pas de `user` → redirection `/login` (avec `state.from`) ;
3. `user.status === 'PENDING'` → redirection `/waiting-approval` ;
4. `allowedRoles` non satisfait → redirection `/`.

> ⚠️ Le type `UserStatus` est `'PENDING' | 'ACTIVE' | 'REJECTED'` — **il manque `SUSPENDED`**, présent dans l'enum back. Sans conséquence aujourd'hui (le login d'un compte suspendu est refusé côté API), mais c'est une dérive de type à corriger.

## Couche API

Tout passe par [`src/api/client.ts`](../src/api/client.ts) — **ne pas écrire de `fetch` brut dans une page**.

```ts
getJSON<T>(path)            // GET
postJSON<T>(path, body)     // POST
patchJSON<T>(path, body)    // PATCH
deleteJSON<T>(path)         // DELETE
uploadFile(file)            // POST /storage/upload (multipart)
resolveUrl(url)             // URL relative de l'API → URL absolue
```

Ces helpers gèrent :
- l'injection du `Authorization: Bearer <token>` ;
- la purge du token sur `401` ;
- le décodage des erreurs API, y compris les tableaux d'erreurs Zod, via `parseApiError()` — qui produit un message multi-ligne `champ: message`.

**Constantes** : `API_URL` (depuis `VITE_API_URL`) et `BASE_URL` (= `API_URL` sans le suffixe `/api`), utilisée par `resolveUrl` pour les fichiers.

> Deux endroits contournent encore ces helpers avec un `fetch` direct : `src/pages/admin/Invoices.tsx` lignes ~100 et ~104 (suppression). Ces appels **ne testent pas `res.ok`** — une suppression refusée par l'API retire quand même la ligne de l'interface. À migrer vers `deleteJSON`.

## Conventions UI

- **Tailwind v4** via le plugin Vite `@tailwindcss/vite`. Il n'y a **pas de `tailwind.config.js`** : le thème est déclaré en CSS dans `src/index.css`.
- Palette : `primary-*` (accent chaud) et `secondary-*` (gris/anthracite). Fond des zones connectées `bg-secondary-50`, cartes `bg-white rounded-xl border border-secondary-200 shadow-sm`.
- Icônes **lucide-react** exclusivement — 14–18 px dans les tableaux, 40–48 px dans les états vides.
- Textes, labels et messages d'erreur **en français**. Dates via `toLocaleDateString('fr-FR')`.
- Pas de librairie de formulaire ni de state : `useState` par champ, `useEffect` au montage pour charger, `loading` / `error` locaux.
- Les tableaux admin sont enveloppés dans `<div className="overflow-x-auto">` pour le scroll horizontal mobile.
- **Ne jamais afficher un identifiant de commande à la main.** Passer par `orderRef()` de [`src/lib/orders.ts`](../src/lib/orders.ts), qui renvoie `orderNumber` ou, à défaut, une mention explicite `Sans n° (ABC123)`. Afficher `id.slice(-6)` produit des références qui ne correspondent à aucune commande — c'est exactement ce que le client a signalé sur les factures. Même règle pour les libellés de statut : `orderStatusLabel()`.
- **Une liste qui grandit avec les données doit être plafonnée.** Hauteur maximale + `overflow-y-auto` sur le conteneur, pour que la page garde une hauteur stable (cf. l'historique du compte poids dans `WeightGauges.tsx`).

## Composants notables

**`STLViewer.tsx`** — visualiseur three.js : chargement STL/OBJ, `MeshPhysicalMaterial`, environnement HDRI via `PMREMGenerator` + `RoomEnvironment`, contrôles orbitaux, calcul de volume et de dimensions. Utilisé dans 5 pages : devis client, détail de commande client et admin, bibliothèque admin, moules client.

Trois tables y cohabitent :
- `MATERIAL_CONFIG` — palette de rendu par matériau (couleur, `metalness`, `roughness`, densité). **Elle conserve tous les alliages**, y compris ceux retirés du catalogue de devis, parce que les pages commandes affichent des matériaux historiques.
- `MATERIAL_ALIASES` — mappe la nomenclature de `admin/Orders.tsx` (`OR_750_JAUNE`…) vers celle de `MATERIAL_CONFIG` (`OR_JAUNE_750`…). Sans elle, toutes les commandes créées depuis l'admin retombent sur l'or jaune par défaut.
- `resolveMaterial()` / `resolveRoughness()` — point d'entrée unique, utilisé à la fois à la création du mesh et à la mise à jour du matériau.

> Le pipeline de rendu est volontairement lumineux (`toneMappingExposure` 2.5, `environmentIntensity` 1.5, `envMapIntensity` 2.0, 5 sources). À `metalness: 1.0` un `MeshPhysicalMaterial` n'a plus de composante diffuse et les couleurs claires saturent en blanc. C'est pourquoi tous les métaux sont à `0.9` avec des albédos volontairement sombres. **Éclaircir une couleur ou remonter `metalness` à 1.0 délave le métal.**

Garde-fous mobiles présents : `setPixelRatio(Math.min(devicePixelRatio, 2))` et `touchAction: 'none'`. Manquent : détection de perte de contexte WebGL, limite de taille de fichier, dégradation de l'antialiasing sur GPU faible.

**`ImageViewerModal.tsx`** — lightbox pour les photos de moules. Utilisé dans `admin/Library.tsx` et `client/Molds.tsx`.

**`WeightGauges.tsx`** — jauges de solde des comptes poids.

## Dette front connue

- **Aucun composant `Modal` partagé.** 15 modales sont écrites en dur dans 11 fichiers, avec des overlays divergents — parfois dans le même fichier : `admin/Library.tsx` utilise `bg-black/70` pour l'une et `bg-secondary-950/40 backdrop-blur-sm` pour l'autre.
- **Pages volumineuses** : `admin/Orders.tsx` 722 l., `admin/UsersPending.tsx` 664 l., `admin/OrderDetail.tsx` 614 l. Logique métier, appels API et markup mélangés, sans hook extrait.
- **Aucun test.** Ni unitaire, ni composant, ni e2e.
- `alert()` / `confirm()` natifs utilisés pour les retours utilisateur dans les pages admin, alors qu'un composant `Alert.tsx` existe.

## Build

```bash
pnpm dev        # http://localhost:5173
```

```bash
pnpm build      # tsc -b && vite build → dist/
```

```bash
pnpm lint
```

> ⚠️ `pnpm build` fait `tsc -b` **avant** le bundle : un import ou une variable inutilisée fait échouer le build. Penser à nettoyer les imports en supprimant du code.
> `vite` est surchargé par **`rolldown-vite`** via un `pnpm.overrides` dans `package.json`. Si un plugin Vite se comporte bizarrement, c'est la première piste.
