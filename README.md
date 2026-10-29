# ProfileLink

Plateforme SaaS de profils professionnels — lien unique + QR code, multi-profils.

## Stack (tout-en-un)

| Couche | Techno |
|--------|--------|
| App complète (landing, auth, dashboard, éditeur, **page publique `/p/[slug]`**, API, admin) | **Next.js** (`web/`) |
| Base de données | **PostgreSQL** local |
| Auth | Email / mot de passe |
| QR code | Génération serveur (`qrcode`) |

La page publique n’est plus une app Vite séparée : c’est une route Next.js (`/p/[slug]`), pour tout garder au même endroit.

Design : [Figma](https://www.figma.com/design/dHoq2oeVG5pgUB4kI5ZHbf/Untitled) — bleu `#1D4ED8` / `#0037B0` + orange `#A33900`.

## Démarrage

Prérequis : PostgreSQL local (ex. service `postgresql-x64-17`), base `profilelink`.

```bash
cd web
cp .env.example .env   # si besoin
npm install
npm run db:migrate
npm run db:seed
npm run dev
# → http://localhost:3000
```

### Comptes seed

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| User Pro | `alex@profile.link` | `password123` |
| Admin | `admin@profile.link` | `admin12345` |

`DATABASE_URL` : `postgresql://postgres:postgres@localhost:5432/profilelink`

## Routes principales

- `/` — Landing
- `/fonctionnalites`, `/exemples`, `/tarifs`, `/faq`, `/contact`
- `/connexion`, `/inscription`
- `/app` — Dashboard
- `/app/profils`, `/app/profils/[id]` — Liste & éditeur
- `/app/qr-codes`, `/app/qr-codes/nouveau`, `/app/qr-codes/[id]` — QR codes personnalisés (liste, statistiques, studio)
- `/app/statistiques`, `/app/parametres`, `/app/aide`
- `/p/[slug]` — **Profil public** (QR + partage)
- `/generateur-qr` — Générateur de QR codes public (sans compte, export SVG/PNG)
- `/r/[code]` — Redirection des QR dynamiques (compte le scan puis redirige)
- `/admin` — Back-office

Maquettes HTML de référence : `stitch-export/` et `maquettes/trame-qr.html` (studio QR).

## Studio QR code

Tout lien peut devenir un QR code personnalisé : 12 modèles, 7 formes de modules, coins, couleurs et dégradés, logo (icône, initiales ou image importée), cadre avec texte, et un score de lisibilité. Le rendu (`web/src/lib/qr-style.ts`) est le même côté navigateur et côté serveur.

- **Statique** : le lien est inscrit dans le motif. Disponible pour tous, sans compte sur `/generateur-qr`.
- **Dynamique** (Pro et Équipe) : le QR encode `/r/{code}`. La destination reste modifiable après impression et chaque scan est compté (jour, appareil, ville).

Après mise à jour, appliquez le schéma : `npm run db:migrate` (ou `npm run db:push` si votre base a été créée avec `db push`).
