# 02 — Frontend

SPA React 19 + Vite + Tailwind 4. Une seule application sert la vitrine publique, l'espace client et le back-office admin.

## Arborescence

```
src/
├── App.tsx             toutes les routes (createBrowserRouter)
├── main.tsx            point d'entrée
├── index.css           Tailwind + charte (couleurs, polices, animations)
├── api/client.ts       couche HTTP unique
├── lib/
│   ├── site.ts         coordonnées, réseaux sociaux, liens des services
│   ├── photos.ts       registre des photos de la vitrine
│   └── …               orders, format, contactMail
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
│   ├── ui/tooltip.tsx      (Radix ; provider dans ClientLayout)
│   ├── brand/Logo.tsx      mot-logo « La Grenaille » en SVG
│   └── vitrine/            composants de la vitrine (en-tête, pied de page,
│                           héros, cartes, bague 3D, formulaire de contact…)
├── pages/
│   ├── public/    Home, Services, Fonte, Impression, Moulage, Contact, Login, Register,
│   │              ResetPassword, WaitingApproval, CGV, MentionsLegales,
│   │              PrivacyPolicy, Quote, ErrorPage
│   ├── client/    Dashboard, WeightAccount, Quote, Orders, OrderDetail,
│   │              MyInvoices, Molds, Profile
│   └── admin/     UsersPending, UserProfile, Weights, Orders, OrderDetail,
│                  Invoices, CreateInvoice, Library
└── assets/photos/      photos de la vitrine en WebP (1408 px + 768 px)
```

## Routing

Tout est déclaré dans [`src/App.tsx`](../src/App.tsx), en un seul `createBrowserRouter`. Trois branches.

### Vitrine — `PublicLayout`
`/` · `/login` · `/register` · `/reset` · `/waiting-approval` · `/services` · `/fonte` · `/impression` · `/moulage` · `/contact`

Chaque page de service a son propre fichier (`Fonte.tsx`, `Impression.tsx`, `Moulage.tsx`) : **les textes sont dans la page**, assemblés à partir des composants de `src/components/vitrine/`. Les textes viennent des maquettes du client (retour du 2026-10-22).

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

> Les routes admin sont **imbriquées sous `/client`**, pas sous un préfixe `/admin`. Une nouvelle page admin va dans les `children` de `/client`, avec `path: 'admin/…'` et une double protection. Comme toute page hors vitrine, elle est importée en `lazy()` (voir [Build](#build)) :

```tsx
const MaPage = lazy(() => import('./pages/admin/MaPage'));

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
- **Charte de la vitrine**, tirée des cartes de visite du client :
  - fond `ivoire`, sections alternées `lin`, cartes `papier` bordées de `sable` ;
  - **`charbon` réservé à l'en-tête et au pied de page** ;
  - `or` pour les filets et ornements **uniquement**, jamais pour du texte (2,1:1 sur ivoire) ; `bronze` pour les liens et le texte d'accent ;
  - polices : Libre Baskerville (titres et texte), Montserrat (interface), logo en SVG (`components/brand/Logo.tsx`, couleur héritée de `currentColor`).
  - Référence visuelle : le canevas « La Grenaille — Charte & maquette ».
- Palette de l'espace connecté : `primary-*` (accent, réaligné en 2026-10 sur l'or de la charte, mêmes niveaux de clarté qu'avant) et `secondary-*` (gris). Fond des zones connectées `bg-secondary-50`, cartes `bg-white rounded-xl border border-secondary-200 shadow-sm`.
- **Photos de la vitrine** : uniquement via `PHOTOS` de [`src/lib/photos.ts`](../src/lib/photos.ts). `provisional: true` affiche le badge « Photo provisoire ». Les visuels actuels sont des images d'attente générées par IA. Quand une vraie photo arrive, on remplace le fichier et on passe le drapeau à `false`. Les emplacements sans photo du tout utilisent `PhotoPlaceholder`.
- **Coordonnées et réseaux sociaux** : uniquement via [`src/lib/site.ts`](../src/lib/site.ts). Un réseau dont `href` vaut `null` affiche son icône sans lien.
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

**`vitrine/RingShowcase.tsx`** — section « De la cire au métal » de l'accueil : une bague granulée en 3D (three.js, rendu PBR avec `RoomEnvironment`) et 8 matières, de la résine au platine. La scène (`vitrine/ring/RingScene.tsx`) est chargée à l'approche de la section, mise en pause hors écran et sans rotation automatique si `prefers-reduced-motion`. Sans WebGL, elle bascule sur un visuel statique (test : `RingShowcase.test.tsx`). Ce pipeline est indépendant de celui du `STLViewer` : ses couleurs sont des réflectances physiques et ne doivent pas être recopiées dans `MATERIAL_CONFIG`.

**`ImageViewerModal.tsx`** — lightbox pour les photos de moules. Utilisé dans `admin/Library.tsx` et `client/Molds.tsx`.

**`WeightGauges.tsx`** — jauges de solde des comptes poids.

## Dette front connue

- **Aucun composant `Modal` partagé.** 15 modales sont écrites en dur dans 11 fichiers, avec des overlays divergents — parfois dans le même fichier : `admin/Library.tsx` utilise `bg-black/70` pour l'une et `bg-secondary-950/40 backdrop-blur-sm` pour l'autre.
- **Pages volumineuses** : `admin/Orders.tsx` 722 l., `admin/UsersPending.tsx` 664 l., `admin/OrderDetail.tsx` 614 l. Logique métier, appels API et markup mélangés, sans hook extrait.
- **Peu de tests** : Vitest + Testing Library (`pnpm test`) couvrent le `STLViewer`, l'`ErrorBoundary`, le mot de passe oublié, la bague 3D, l'en-tête, le formulaire de contact et le provider d'infobulles de `ClientLayout`. Aucun test e2e.
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

### Découpage du bundle

Le chunk d'entrée (`index-*.js`) ne porte que la vitrine et la connexion : un visiteur de l'accueil télécharge **116 Ko gzip** de JS (366 Ko minifiés), contre 326 Ko gzip (1,2 Mo) avant le découpage d'octobre 2026. Le reste passe par `lazy()` dans [`App.tsx`](../src/App.tsx) et n'est téléchargé qu'à la première visite :

| Chargé à la demande | Pourquoi |
|---|---|
| `ClientLayout` et chaque page de `/client/*` et `/client/admin/*` (un chunk par page) | `STLViewer` et three.js (132 Ko gzip) ne viennent qu'avec les pages qui affichent un modèle 3D |
| Radix Tooltip (24 Ko gzip) | son `TooltipProvider` est dans `ClientLayout`, plus à la racine de l'app : c'est lui qui l'attirait dans l'entrée |
| CGV, mentions légales, confidentialité, inscription, réinitialisation du mot de passe | pages longues ou rarement ouvertes |
| La scène 3D de la bague (`RingScene`) | à l'approche de sa section |

Restent dans l'entrée, pour une navigation immédiate : l'accueil, les pages de services, le contact, la connexion, `WaitingApproval`, `ErrorPage` et `LegalLayout` (1 Ko : différé, il retarderait sa page d'un aller-retour réseau).

**Une nouvelle page hors vitrine s'importe en `lazy()`**, jamais par un `import` statique dans `App.tsx` : sinon elle et ses dépendances reviennent dans l'entrée.

**États de chargement**
- Pendant une navigation, React Router passe par une transition : la page courante **reste affichée** le temps du téléchargement, aucun fallback ne clignote.
- Sur un chargement direct (lien partagé, rechargement), les `Suspense` prennent le relais : [`PageFallback`](../src/components/vitrine/PageFallback.tsx) dans `PublicLayout` (filet grenaille en fondu, invisible les 300 premières ms) et le spinner habituel des pages dans `ClientLayout`. La frontière de `App.tsx` ne rattrape que `ClientLayout` lui-même, avec l'écran d'attente de `ProtectedRoute`.
- Le bouton de `Login` reste sur « Connexion… » jusqu'à l'affichage de l'espace client.

**Garde-fous**
- `vite.config.ts` **fait échouer le build** si three.js se retrouve dans l'entrée ou dans un chunk qu'elle importe statiquement (plugin `keepThreeOutOfEntry`).
- Chaque déploiement remplace l'image nginx : les chunks de la version précédente disparaissent. `main.tsx` écoute `vite:preloadError` et recharge la page pour récupérer le nouvel `index.html`, au plus une fois toutes les 10 s ; au-delà, `ErrorPage` s'affiche.

> Le build avertit encore « Some chunks are larger than 500 kB » : c'est `three.module-*.js` (520 Ko), chargé à la demande, pas l'entrée.
> Rolldown isole chaque icône lucide partagée entre plusieurs pages dans un micro-chunk (0,1 à 0,5 Ko). Ils sont préchargés en parallèle avec leur page (`modulepreload`), sans cascade.
