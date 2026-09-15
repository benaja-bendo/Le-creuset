# 05 — Audit des retours clients (côté front)

Vérification des demandes du client **contre le code réel**, pas contre les cases à cocher des documents d'origine (elles sont toutes restées vides).

Audit initial réalisé le **9 août 2026** sur `develop` (`79369cb`). Ce document couvre **la part interface**. Les points serveur (routes, permissions, numérotation, suppression de compte) sont audités dans le repo `Le-creuset-backend`, fichier `docs/05-audit-retours-clients.md`.

---

## Retours de septembre 2026

Retour du 15/09 après mise à jour de la dev pour test client. Verbatim et
décorticage complet dans `sites/retours-clients/2026-09-15-retour-dev.md`
(non versionné, hors de ce repo).

### ✅ Quantité affichée en trop dans le détail de commande client

Tuile "Quantité" retirée de [`src/pages/client/OrderDetail.tsx`](../src/pages/client/OrderDetail.tsx) — reste une donnée interne, déjà éditable côté admin depuis le lot 5 de l'audit d'août.

### ✅ Devis STL absent du menu admin

"Devis STL" ajouté à `adminMenuItems` dans [`src/layouts/ClientLayout.tsx`](../src/layouts/ClientLayout.tsx). La route `/client/quote` était déjà accessible par URL directe (non restreinte par rôle) — il manquait seulement l'entrée de menu.

### ✅ Boutons KBIS/Douanes vides sur une demande d'inscription

**Cause racine** : dans [`src/pages/admin/UsersPending.tsx`](../src/pages/admin/UsersPending.tsx), les boutons KBIS et Douanes étaient rendus sans condition. Ces deux champs sont optionnels à l'inscription (`src/pages/public/Register.tsx`) ; quand le document manque, `resolveUrl(undefined)` renvoie `''` → `href=""` → le clic ouvre l'app elle-même sans rien afficher. `admin/UserProfile.tsx` gérait déjà correctement ce cas.

**Correction** : boutons conditionnés à la présence du fichier, pastille "non fourni" grisée sinon.

### ✅ Modale "Historique" de admin/Weights.tsx non plafonnée

Fermeture du point explicitement laissé ouvert par l'audit d'août, voir plus bas ("Historique du compte poids qui allongeait la page") : *« La modale d'historique de `admin/Weights.tsx` est un troisième historique indépendant, non modifié. »*

**Correction** : [`src/pages/admin/Weights.tsx`](../src/pages/admin/Weights.tsx) applique désormais le même plafond que [`WeightGauges.tsx`](../src/components/WeightGauges.tsx) (`VISIBLE_TRANSACTIONS`/`HISTORY_MAX_HEIGHT`, exportées et réutilisées plutôt que dupliquées). Titre corrigé de "Historique complet" (faux — l'API plafonne à 10) en "Historique des mouvements".

> Le point client équivalent côté client (`client/WeightAccount.tsx`) était déjà correct : ce composant partage le même `WeightGauges.tsx` que `admin/UserProfile.tsx`, auquel le client comparait. Aucun changement nécessaire là.

PR [`Le-creuset#11`](https://github.com/benaja-bendo/Le-creuset/pull/11), déployée en prod le 15/09.

### ✅ Couleurs des métaux dans le devis STL — toujours fausses malgré le correctif d'août

Le client a signalé que le problème persistait après la correction ci-dessous ("Harmonisation du rendu 3D des métaux") : celle-ci avait assombri les albédos mais explicitement laissé le pipeline d'éclairage intact. Insuffisant — à `toneMappingExposure: 2.5` / `environmentIntensity: 1.5` / `envMapIntensity: 2.0` / ~7.5 d'intensité directionnelle cumulée, les métaux clairs (argent, platine, or gris) saturaient toujours en blanc, quel que soit leur albédo.

**Deux itérations, la deuxième après recherche** :
1. Un premier correctif s'est contenté de réduire uniformément les 4 multiplicateurs — corrige la saturation blanche, mais rendu jugé trop sombre par Benji pour un outil de visualisation bijouterie professionnelle.
2. Recherche faite sur les conventions de rendu bijouterie pro (studios à fort contraste, plusieurs sources à 45°, jamais un éclairage plat isotrope — *"metal is fully specular… appearance depends entirely on lighting and the environment"*, [Light Tracer](https://lighttracer.org/blog/tutorial-jewelry-rendering/)). Cause plus profonde identifiée : [`RoomEnvironment`](https://github.com/mrdoob/three.js/blob/master/examples/jsm/environments/RoomEnvironment.js) (three-stdlib) est un environnement générique plat et peu contrasté (panneaux blancs uniformes, conçu pour du mobilier via model-viewer), pas pour un bijou qui doit accrocher la lumière sous plusieurs angles.

**Correction retenue** : `createJewelryStudioEnvironment()` dans [`src/components/STLViewer.tsx`](../src/components/STLViewer.tsx) remplace `RoomEnvironment` — même technique (panneaux émissifs bakés en PMREM) mais disposition studio bijouterie (deux clés à 45° d'intensité inégale, fill zénithal, rim arrière, léger rebond au sol). Avec un environnement qui porte déjà le contraste, l'exposition globale a pu remonter sans re-saturer les métaux clairs.

**Bug annexe corrigé au passage** : `loadModel` avait `materialType`/`finishType` dans ses dépendances alors qu'un `useEffect` séparé met déjà le matériau à jour à chaud sur le mesh existant — chaque clic sur un métal re-téléchargeait donc le fichier et recadrait la caméra, rendant la comparaison de teintes pénible. Corrigé (lecture via ref, retirées des dépendances).

> **Limite connue, non résolue** : argent, platine et or gris palladié restent visuellement proches entre eux même après correctif — limite physique du rendu à `metalness: 0.9` (réflexion d'environnement dominante, peu de composante diffuse portant l'albédo), pas quelque chose qu'un réglage de lumière peut résoudre seul.

Validé visuellement par Benji sur planche de comparaison avant merge (2 itérations). PR [`Le-creuset#15`](https://github.com/benaja-bendo/Le-creuset/pull/15), déployée en prod le 15/09.

---

## Retours d'août 2026 — corrigés

### ✅ Catalogue du devis instantané restreint à 7 matériaux

Sur demande client, [`src/pages/client/Quote.tsx`](../src/pages/client/Quote.tsx) ne propose plus que : **Or Jaune 750, Or Jaune 375, Or Gris 750 Palladié 13 %, Platine 950, Argent 925, Laiton, Prototype Résine**.

Retirés du devis : Or Rose 375/750, Or Gris 375, Or Gris 750 (nu), Or Rouge 750, Prototype Visuel.

> Le client écrivait « Or 325 » — il n'existe pas de titre 325 (les titres légaux sont 375, 585, 750, 916, 999). Lu comme **Or 375**, arbitrage validé.

> `MATERIAL_CONFIG` dans `STLViewer.tsx` **conserve tous les alliages**, y compris les retirés : les pages commandes affichent des matériaux historiques déjà en base. Ne pas y supprimer d'entrée.

### ✅ Harmonisation du rendu 3D des métaux

**Ce que le client voyait** : « la couleur du laiton est bien, fais pareil pour les autres métaux ».

**Cause racine** : le pipeline de `STLViewer.tsx` empile `toneMappingExposure` 2.5, `environmentIntensity` 1.5, `envMapIntensity` 2.0 et 5 sources lumineuses. À `metalness: 1.0`, un `MeshPhysicalMaterial` n'a **aucune composante diffuse** : sa teinte ne vient que du reflet d'environnement, qui sature en blanc dès que la couleur de base est claire. Les métaux blancs (argent, platine, or gris) partaient d'albédos très clairs (`0xe3e4e5`, `0xe5e4e2`, `0xe6e6e6`) et se rendaient donc en blanc délavé. Le laiton était **le seul matériau à `metalness: 0.9`** avec une couleur sombre et saturée (`0xb5a642`) — d'où son rendu correct.

**Correction** : tous les métaux alignés sur le traitement du laiton — `metalness: 0.9`, albédos ramenés à des valeurs de réflectance plausibles, et **`roughness` propre à chaque métal** (auparavant tous les métaux tombaient sur `0.15`, la formule ne dépendant que de `metalness`). L'exposition globale du pipeline n'a pas été touchée, pour ne pas modifier l'apparence des 5 écrans qui utilisent le viewer.

Les pastilles de couleur du sélecteur passent de classes Tailwind à l'hexadécimal exact de `MATERIAL_CONFIG` : la pastille et l'aperçu 3D montrent désormais la même teinte.

> ~~⚠️ Validation visuelle client requise.~~ Le client a effectivement signalé
> en septembre que les métaux clairs restaient délavés malgré cette
> correction — voir "Retours de septembre 2026" ci-dessus : la cause plus
> profonde était le pipeline d'éclairage lui-même (volontairement non touché
> ici), pas seulement les albédos. Corrigé et validé par le client le 15/09.

### ✅ Numéros de commande faux sur les factures

**Ce que le client voyait** : des numéros qui ne correspondaient à rien, sur les factures groupées comme dans le sélecteur « commande associée », et la disparition des notes de commande.

La cause racine est côté back (un `select` Prisma imbriqué qui amputait `orderNumber` et `notes` — voir l'audit back). Côté front, **5 écrans affichaient `id.slice(-6)`**, la queue du `cuid` technique :

| Écran | Correction |
|---|---|
| `admin/Invoices.tsx` — colonne Commande(s), factures groupées | liste des vrais numéros, avec `title` complet au survol |
| `admin/Invoices.tsx` — factures individuelles | numéro de la commande liée |
| `admin/CreateInvoice.tsx` — sélecteur « commande associée » | numéro + statut **en français** + date + notes de la commande |
| `client/MyInvoices.tsx` | numéro + notes de la commande |
| `client/Dashboard.tsx` | colonne renommée « N° Commande » |

Les **notes de commande** (`Order.notes`) sont désormais affichées **en plus** des notes de facture (`Invoice.notes` / `InvoiceGroup.notes`) — ce sont deux champs distincts, l'un ne remplace pas l'autre. Sur une facture groupée, chaque note est préfixée du numéro de sa commande quand il y en a plusieurs.

**Au passage** : la référence de commande est maintenant produite par un helper partagé, [`src/lib/orders.ts`](../src/lib/orders.ts) → `orderRef()`, utilisé par les **9 écrans** qui affichent une commande, avec `orderStatusLabel()` pour les statuts. Les variantes locales ont été supprimées. Une commande sans `orderNumber` (antérieure à la migration) affiche `Sans n° (ABC123)` plutôt qu'un fragment d'identifiant maquillé en numéro.

### ✅ Montant faux sur les factures groupées

Trouvé en relisant le correctif ci-dessus, dans le même écran que le bug signalé.

`admin/Orders.tsx` pré-remplissait le montant de la facture groupée avec :

```ts
selectedOrdersData.reduce((sum, o) => sum + (o.estimatedPrice || 0), 0)
```

`estimatedPrice` est un **`Decimal` Prisma** : `Decimal.prototype.toJSON()` le sérialise en **chaîne**. L'opérateur `+` concaténait donc au lieu d'additionner — deux commandes à 120,50 € et 80 € donnaient `"0120.5080"` dans le champ Montant. Corrigé par un `Number()` explicite.

### ✅ Soldes de métal affichés sans format français

Même cause, second symptôme, trouvé en cherchant d'autres occurrences du bug ci-dessus.

`String.prototype.toLocaleString()` est hérité d'`Object.prototype` : il **ignore ses arguments**. Un solde arrivant en chaîne traversait donc `toLocaleString('fr-FR', { minimumFractionDigits: 2 })` sans être formaté :

```
"12.5".toLocaleString('fr-FR', { minimumFractionDigits: 2 })  →  "12.5"
Number("12.5").toLocaleString('fr-FR', { minimumFractionDigits: 2 })  →  "12,50"
```

Le client voyait donc `12.5 g` au lieu de `12,50 g` — sur *Mon Compte Poids*, le tableau de bord, les comptes poids admin et la fiche client admin. Cinq points d'affichage corrigés.

> **Règle générale : tout champ `Decimal` du schéma arrive en chaîne côté front.** `MetalAccount.balance`, `Transaction.amount`, `Order.estimatedPrice`, `Invoice.amount`, `InvoiceGroup.amount`, `Quote.totalPrice`.
>
> Passer par [`src/lib/format.ts`](../src/lib/format.ts) → `formatGrams()`, `formatAmount()`, `toNumber()` plutôt que d'appeler `.toLocaleString()` ou d'additionner directement une valeur venue de l'API. Les types front déclarent `number` alors que le fil transporte une `string` : TypeScript ne détecte donc rien, seuls ces helpers protègent.

### ✅ Tableau de bord client allégé

`client/Dashboard.tsx` : la rangée de 4 compteurs (Commandes en cours, Devis en attente, En production, Total expédiées) et le panneau « Actions Rapides » sont retirés. Restent les **comptes métaux** et les **dernières commandes**, désormais en pleine largeur.

> La vue **admin** du même fichier est strictement inchangée — `StatCard` et `QuickAction` restent utilisés par `AdminDashboard`.

> Au passage : le compteur « Devis en attente » était de toute façon faux — il comptait des commandes au statut `EN_ATTENTE` issues de `/orders/me`, pas des devis.

### ✅ Historique du compte poids qui allongeait la page

**Cause racine** : dans [`src/components/WeightGauges.tsx`](../src/components/WeightGauges.tsx), le conteneur de lignes n'avait ni hauteur maximale ni `overflow`. Chaque transaction ajoutait ~81 px à la hauteur du document.

**Correction** : hauteur plafonnée à `max-h-[19rem]` (~4 mouvements visibles) avec `overflow-y-auto overscroll-contain`. L'en-tête affiche le nombre de mouvements, et un pied de carte annonce combien de mouvements plus anciens sont accessibles au défilement.

> `WeightGauges` est **partagé** avec la fiche client côté admin (`admin/UserProfile.tsx`) : le plafonnement s'y applique aussi. La modale d'historique de `admin/Weights.tsx` était un **troisième** historique indépendant, non modifié — corrigé en septembre, voir "Retours de septembre 2026" ci-dessus.

> ⚠️ **Plafond API à 10.** `weights.service.ts` limite à `take: 10` transactions par compte. L'encadré scrollable ne peut donc pas montrer plus de 10 mouvements, quel que soit l'historique réel. Non modifié ici (le client demandait moins de hauteur, pas plus d'historique) — à revoir si « voir plus » doit signifier « tout l'historique ».

---

## Retours de juin 2026

### ✅ Suppression du symbole « $ » sur les factures

Commit `79369cb` — *style: remove dollar sign icon from invoice amount display*. Plus aucun `$` d'affichage ; les montants sont rendus en `€` (`admin/Invoices.tsx:215`, `client/MyInvoices.tsx:105`, `admin/CreateInvoice.tsx:215`).

### ✅ Visualiseur d'images dans la bibliothèque

[`src/components/ImageViewerModal.tsx`](../src/components/ImageViewerModal.tsx) est branché dans `admin/Library.tsx:348` et `client/Molds.tsx:249`. Les photos de moules sont cliquables (`Library.tsx:318`).

### ✅ Visualiseur 3D STL au clic

[`src/components/STLViewer.tsx`](../src/components/STLViewer.tsx) (471 l., three.js + three-stdlib) est branché dans 5 pages : `admin/OrderDetail.tsx`, `admin/Library.tsx` (bouton « Aperçu 3D », `:272`), `client/OrderDetail.tsx`, `client/Molds.tsx`, `client/Quote.tsx`.

### ✅ Retirer le dépôt métal de la vue commande client

Aucune occurrence de `weight`, `poids`, `dépôt`, `metal` ou `Gauge` dans [`src/pages/client/OrderDetail.tsx`](../src/pages/client/OrderDetail.tsx). L'information reste sur sa page dédiée `/client/weight-account`.

### ✅ Numérotation des commandes — suggestion avant création

Le numéro est pré-rempli et affiché **avant** la création, dans un champ éditable par l'admin (`admin/Orders.tsx:430-431`), avec un bouton de régénération (`:331`).

> ⚠️ La génération est `CMD-${Date.now().toString().slice(-6)}` — non séquentielle et non garantie unique. Deux créations rapprochées violent la contrainte `@unique` et remontent une erreur Prisma brute.

### 🟠 Migration de la modale vers une page dédiée — 3 sous-points sur 4

| Sous-demande | Statut |
|---|---|
| Page complète au lieu d'une modale | ✅ route `/client/admin/invoices/new` → [`admin/CreateInvoice.tsx`](../src/pages/admin/CreateInvoice.tsx) (`App.tsx:222`) |
| Affichage persistant du dépôt métal | ✅ bloc dédié `CreateInvoice.tsx:228` — type de métal, sens (crédit/débit), masse, avec la règle « laisser vide pour ne pas toucher au compte » |
| Liste récapitulative des factures | ✅ tableau de `admin/Invoices.tsx`, individuelles et groupées fusionnées |
| **Vue détaillée par facture** | 🔴 **absente** — aucune route `/client/admin/invoices/:id`. Le bouton « Voir » ouvre juste un `<iframe>` sur le PDF (`Invoices.tsx:250`). |

### 🟠 Optimisation responsive globale — partiel

**Fait** : le `ClientLayout` a une vraie navigation mobile (sidebar en tiroir `lg:translate-x-0` + overlay + bouton hamburger). Les 3 tableaux admin sont enveloppés dans `overflow-x-auto`.

**Pas fait** :
- [`admin/Orders.tsx`](../src/pages/admin/Orders.tsx) — la plus grosse page admin (722 lignes) — contient **zéro classe de breakpoint** (`sm:` / `md:` / `lg:`) ;
- `admin/UsersPending.tsx` : 2 classes responsives sur 664 lignes ;
- quatre grilles `grid-cols-2` sans breakpoint, qui restent sur deux colonnes en 375 px : `OrderDetail.tsx:267` et `:544`, `Weights.tsx:323`, `UsersPending.tsx:231` ;
- trois largeurs fixes en pixels : `Orders.tsx:586` (`w-[200px]`), `Invoices.tsx:240` (`w-[150px]`), `UserProfile.tsx:204` (`w-[200px]`).

**Verdict** : le châssis est responsive, le contenu des pages ne l'est pas. Il n'y a pas eu de passe complète.

### 🟠 Groupement de commandes (signalé « critique ») — part front

Garde-fous présents avant l'appel : contrôle « même client » (`admin/Orders.tsx:148-153`) et confirmation si des commandes ne sont pas encore `FONDU`/`EXPEDIE` (`:155-160`).

**Ce qui reste cassé côté front :**

1. 🔴 **Le client ne voit jamais une facture groupée.** `client/MyInvoices.tsx:38` ne lit que `/invoices/me` ; les factures groupées vivent dans `/invoice-groups`, sans route client. Voir l'audit back.
2. 🟠 **Suppression silencieusement ratée.** `admin/Invoices.tsx:96-112` utilise un `fetch` brut sans tester `res.ok`, puis retire la ligne de l'état local dans tous les cas. Un `DELETE` refusé affiche un faux succès ; la facture réapparaît au rechargement.
3. 🟡 **Montant non recalculé.** Le total proposé est la somme des `estimatedPrice` (`Orders.tsx:162`), éditable ; rien ne le rapproche des montants réels après clôture.

### 🔴 Uniformisation des modales — non fait

Il n'existe **aucun composant `Modal` partagé** dans `src/components/`. 15 modales sont écrites en dur dans 11 fichiers :

```
admin/Orders.tsx           3      client/OrderDetail.tsx     1
admin/UsersPending.tsx     3      client/Molds.tsx           1
admin/Weights.tsx          2      client/MyInvoices.tsx      1
admin/OrderDetail.tsx      2      components/STLViewer.tsx   1
admin/Library.tsx          2      components/ImageViewerModal.tsx 1
admin/Invoices.tsx         1
```

Les overlays divergent, y compris **dans un même fichier** : `admin/Library.tsx:356` utilise `bg-black/70`, `:376` utilise `bg-secondary-950/40 backdrop-blur-sm`.

**À faire** : extraire un `src/components/ui/Modal.tsx` (overlay, fermeture au clic extérieur et à `Escape`, header/body/footer, tailles) puis migrer les 15 occurrences.

### 🔴 Compatibilité mobile des STL — rien de spécifique

Deux garde-fous mobiles existent déjà : `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` plafonne la résolution de rendu, et `touchAction: 'none'` sur le conteneur évite que le scroll de la page vole le geste.

Ce qui manque en revanche :
- pas de détection de support ni de perte de contexte WebGL (`webglcontextlost`) ;
- pas de limite de taille de fichier ni de décimation du maillage à l'import — c'est le premier suspect sur un STL lourd ;
- `antialias: true` et `shadowMap` PCFSoft activés sans dégradation sur GPU mobile ;
- un `try/catch` générique affiche un message d'erreur sans distinguer les causes (réseau, parsing, WebGL).

**Verdict** : le diagnostic demandé n'a pas été fait. À reprendre sur appareil réel, en instrumentant d'abord la taille des STL réellement déposés.

### 🔴 Recette de bout en bout — non faite

**Aucun test front**, d'aucune sorte. Un parcours de recette manuelle en 9 étapes est proposé dans [`03-dev-local.md`](03-dev-local.md#parcours-de-recette-manuelle).

### ❓ Erreur signalée sur `/client/invoices` — indéterminé

Aucun commit de correction identifiable. Le chemin de code est sain : `client/MyInvoices.tsx:38` appelle `GET /invoices/me`, le back renvoie bien la liste.

**Deux hypothèses à départager :**
- **A — page vide perçue comme un bug** : le client dont les commandes ont été facturées en groupe ne voit rien. C'est l'explication la plus probable, et elle est réelle et non corrigée.
- **B — erreur runtime** : un `500` du back, ou un `fileUrl` invalide. Non reproductible sans le message exact.

---

## Reste à faire, par priorité (front)

| Priorité | Action | Où |
|---|---|---|
| 🔴 1 | Afficher les factures groupées dans *Mes Factures* (une fois la route back exposée) | `src/pages/client/MyInvoices.tsx` |
| 🟠 2 | Corriger la suppression silencieuse (`res.ok` non testé) et repasser par `deleteJSON` | `src/pages/admin/Invoices.tsx:96-112` |
| 🟠 3 | Extraire un composant `Modal` partagé et migrer les 15 modales | `src/components/ui/` |
| 🟠 4 | Passe responsive sur `admin/Orders.tsx` en priorité, puis `UsersPending.tsx` | `src/pages/admin/` |
| 🟠 5 | Ajouter une vue détaillée par facture | `src/pages/admin/` + `src/App.tsx` |
| 🟠 6 | Diagnostiquer le STL mobile sur appareil réel, plafonner le `devicePixelRatio` | `src/components/STLViewer.tsx` |
| 🟡 7 | Ajouter `SUSPENDED` au type `UserStatus` | `src/context/AuthContext.tsx` |
