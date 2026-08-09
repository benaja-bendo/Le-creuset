# 01 — Architecture et domaine métier

> **Version condensée pour le front.** La référence complète (modèle Prisma, cycles de vie détaillés, garde-fous back) vit dans le repo `Le-creuset-backend`, fichier `docs/01-domaine-metier.md`. En cas de divergence, c'est le back qui fait foi.

---

## Partie 1 — Architecture

### Trois dépôts indépendants

Le projet n'est **pas** un monorepo. Trois dépôts git autonomes vivent côte à côte dans un dossier parent qui n'est lui-même pas versionné :

| Repo | Remote | Branche | Rôle |
|---|---|---|---|
| `front/` (**ici**) | `benaja-bendo/Le-creuset` | `develop` | SPA React |
| `back/` | `benaja-bendo/Le-creuset-backend` | `develop` | API REST |
| `vps_infra/` | `benaja-bendo/vps_infra` | `main` | Provisionnement serveur |

**Conséquences :**
- pas de commit atomique full-stack — une feature = 2 commits, 2 PR, 2 pipelines ;
- **le back se déploie en premier** quand il introduit un endpoint ou un champ ;
- ne jamais présumer qu'un champ ajouté côté back est déjà en production : vérifier avant de le consommer.

### Flux

```
Navigateur
    │
    ├─ cette SPA, servie par nginx en production        ◄── ce repo
    │
    └─ fetch  ──►  VITE_API_URL  ──►  NestJS, préfixe global /api
                                          │
                                          ├─► PostgreSQL
                                          ├─► MinIO / disque  (uploads, PDF, STL, photos)
                                          └─► SMTP
```

`VITE_API_URL` doit **inclure le suffixe `/api`**. `src/api/client.ts` en dérive `BASE_URL` (l'URL sans `/api`) pour résoudre les URL de fichiers renvoyées par l'API.

### Stack

| | |
|---|---|
| Framework | React 19 |
| Bundler | Vite 7 — **remplacé par `rolldown-vite` via un override pnpm** |
| Routing | react-router-dom 7 (`createBrowserRouter`) |
| Styles | Tailwind CSS 4 via `@tailwindcss/vite` — **pas de `tailwind.config.js`** |
| Icônes | lucide-react |
| 3D | three.js + three-stdlib (visualiseur STL) |
| Animation | GSAP + `@gsap/react` |
| UI | Radix (tooltip uniquement) + composants maison |
| State | `useState` / `useEffect` + un `AuthContext` — aucune lib de state |

---

## Partie 2 — Ce que le front doit savoir du métier

### Le compte poids

Les clients sont des bijoutiers professionnels qui **confient du métal précieux** à la fonderie. Chaque client a un **compte poids par métal pur** (`MetalAccount`), en grammes à 3 décimales :

- **crédit** = le client dépose du métal ;
- **débit** = une commande est fondue ;
- **solde négatif** = le client doit du métal à la fonderie. À traiter visuellement comme une alerte, pas comme une valeur neutre.

**Trois métaux seulement sont actifs** : `OR_FIN`, `ARGENT_FIN`, `PLATINE`. Le back filtre le `PALLADIUM` — ne pas l'afficher ni le proposer.

### Métal pur ≠ alliage

Deux vocabulaires à ne pas mélanger dans l'UI :

| Notion | Enum back | Où ça s'affiche |
|---|---|---|
| **Métal pur** | `BaseMetalType` — `OR_FIN`, `ARGENT_FIN`, `PLATINE` | comptes poids, jauges, transactions |
| **Alliage / service** | `MetalType` — `OR_JAUNE_750`, `OR_GRIS_750_PALLADIE_13`, `PLATINE_950`, `ARGENT_925`, `PROTO_VISUEL`… | devis, commandes |

Le back mappe l'alliage vers le métal pur au moment du débit ; le front n'a jamais à faire cette conversion lui-même.

### Statuts

**Utilisateur** — `PENDING` → `ACTIVE` → `SUSPENDED`, plus `REJECTED`.

- Un compte `PENDING` est redirigé vers `/waiting-approval` par `ProtectedRoute`.
- Un compte `SUSPENDED` ou `REJECTED` ne peut pas se connecter : le back refuse le login avec un message dédié.
- ⚠️ Le type `UserStatus` d'`AuthContext.tsx` ne liste que `'PENDING' | 'ACTIVE' | 'REJECTED'` — `SUSPENDED` manque.

**Commande** — `OrderStatus`, à afficher avec ces libellés :

| Valeur | Libellé français |
|---|---|
| `EN_ATTENTE` | En attente |
| `TIRAGE_OK` | Cires prêtes |
| `FONDU` | Fondu |
| `EXPEDIE` | Expédié |

### Identifier une commande

`Order` porte **deux** identifiants :

- `id` — un `cuid` technique, utilisé dans les URL et les appels API ;
- `orderNumber` — le numéro **métier**, celui que le client et l'admin connaissent.

**Toujours afficher `orderNumber` à l'utilisateur, jamais l'`id`.** Le champ est optionnel dans le schéma : les commandes antérieures à la migration `add_order_number` peuvent l'avoir à `null`, prévoir un repli explicite.

### Facturation : deux objets distincts

| | Facture individuelle | Facture groupée |
|---|---|---|
| Endpoint | `/invoices` | `/invoice-groups` |
| Portée | 0 ou 1 commande | N commandes du même client |
| Visible par le client | ✅ `GET /invoices/me` | ❌ aucune route client |

> 🔴 Conséquence directe pour l'UI : la page *Mes Factures* ne lit que `/invoices/me`. **Un client dont les commandes ont été facturées en groupe n'y voit rien.** Voir [l'audit](05-audit-retours-clients.md).

### Bibliothèque : l'admin dépose, le client consulte

`Mold` (moules) et `LibraryFile` (STL) sont en écriture **admin uniquement**. Côté client, `Molds.tsx` ne fait que lire `/molds/me` et `/library/me` — aucun formulaire d'upload ne doit y réapparaître.

Le client peut uploader un STL sur la page *Devis STL* pour le visualiser, mais ce fichier n'entre pas dans sa bibliothèque.

### Pas de commande dans l'app

Les commandes se passent **par email à `contact@lagrenaille.fr`**. Les boutons « Passer commande » ont été retirés ; les pages *Devis STL* et *Mes Commandes* affichent une bannière de contact. Ne pas les réintroduire.
