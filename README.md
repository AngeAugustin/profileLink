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
- `/app/statistiques`, `/app/parametres`, `/app/aide`
- `/p/[slug]` — **Profil public** (QR + partage)
- `/admin` — Back-office

Maquettes HTML de référence : `stitch-export/`.
