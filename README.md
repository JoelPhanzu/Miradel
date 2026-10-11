# Fondation MIRADEL FEVEPA — miradel.org

Site de la fondation (vitrine institutionnelle + boutique solidaire) et son espace de gestion `/admin`.
Réalisé par Lean Market, sur la même architecture que Mawazo Hair & Beauty.
Voir `CLAUDE.md` (cahier des charges et décisions) et `docs/a-completer.md` (informations manquantes).

**Stack** : Next.js 16 (App Router, Cache Components, build webpack), TypeScript strict,
Tailwind CSS 4, MySQL / MariaDB + Drizzle, Zod, Vitest, Playwright.

## Ports

| Usage | Port |
|---|---|
| `npm run dev` / `npm run start:local` | **3420** |
| Tests Playwright (`npm run test:e2e`) | **3421** |
| Base MariaDB locale (Docker `miradel-mariadb`) | **3308** |
| Hostinger | fourni par Hostinger (`npm start` lit `PORT`) |

(3000, 3210 et 3307 sont déjà utilisés sur le poste de développement, notamment par Mawazo.)

## Variables d'environnement : trois fichiers, trois cibles

| Fichier | Cible | Contenu |
|---|---|---|
| `.env.example` | modèle versionné | toutes les variables, commentées |
| `.env.local` | **LOCAL** (votre PC) | base Docker `127.0.0.1:3308`, site `http://localhost:3420` |
| `.env.hostinger` | **HOSTINGER depuis le PC** | base Hostinger via « MySQL distant » (migrations / remplissage / dépannage) |
| `.env.production` | **PRODUCTION** (à importer dans hPanel) | base `127.0.0.1:3306`, site `https://miradel.org` |

`APP_ENV` (local / hostinger / production) est affiché dans les journaux au démarrage.
Aucun `.env*` réel n'est envoyé sur GitHub.

## Démarrer en local

```bash
npm install
npm run db:local:start     # crée/démarre la base Docker « miradel-mariadb » (port 3308)
npm run db:migrate         # crée les tables (facultatif : le site le fait au démarrage)
npm run db:seed            # contenus de départ + compte admin de .env.local
npm run dev                # http://localhost:3420  (admin : /admin)
```

Sans `DATABASE_URL`, le site public s'affiche avec les contenus de départ (`src/db/seed-data.ts`).

## Base de données : création automatique au déploiement

- Schéma : `src/db/schema.ts` → migrations SQL dans `db/migrations/` (`npm run db:generate`).
- `db:generate` recopie aussi les migrations dans `src/db/migrations.generated.ts` : elles font
  partie du code compilé (le dossier de build Hostinger ne contient pas `db/`).
- **Au démarrage du serveur** (`src/instrumentation.ts` → `src/db/bootstrap.ts`) : migrations
  appliquées, base vide remplie avec les contenus de départ, sessions expirées purgées.
  Rien à lancer à la main chez Hostinger.
- Un test (`src/db/migrations.test.ts`) échoue si `migrations.generated.ts` n'est pas à jour.
- Limite Hostinger : 2 Go. Les images et PDF sont sur le disque (`UPLOAD_DIR`), pas en base.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | développement (port 3420) |
| `npm run build` / `npm start` | production (**webpack** : Turbopack plante sur le build Hostinger) |
| `npm run lint` / `npm run typecheck` | qualité |
| `npm run test` | tests unitaires (prix, promotions, messages WhatsApp, validation, migrations) |
| `npm run test:e2e` | parcours complets Playwright sur la base locale (jamais la production) |
| `npm run db:generate` | nouvelle migration après modification de `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` | base locale (`.env.local`) |
| `npm run db:migrate:hostinger` / `db:seed:hostinger` | base Hostinger depuis le PC (`.env.hostinger`) |

## Mise en ligne chez Hostinger (Node.js Web App) — domaine miradel.org

1. hPanel > **Bases de données MySQL** : créer la base (2 Go max) et son utilisateur ; noter nom,
   utilisateur, mot de passe.
2. hPanel > **Sites web > miradel.org > Node.js Web App** : relier le dépôt GitHub, Node.js 22 ou plus,
   commande de build `npm run build`, commande de démarrage `npm start`.
3. **Variables d'environnement** : importer `.env.production` après y avoir remplacé
   `NOM_DE_LA_BASE`, `UTILISATEUR`, `MOT_DE_PASSE`.
4. Déployer. Au premier démarrage, les tables sont créées et remplies (voir les journaux :
   `[base] tables créées et contenus de départ ajoutés`).
5. Ouvrir `https://miradel.org/admin` : création du compte de la responsable avec le
   **code de première connexion** remis par Lean Market.
6. Photos et PDF : dossier `miradel-uploads` créé à côté de l'application (hors déploiement),
   ou `UPLOAD_DIR` explicite. Sauvegardes : exporter la base (hPanel) **et** ce dossier.
7. Le build fonctionne même si la base n'est pas joignable pendant le build : pages prérendues avec
   les contenus de départ, puis mises à jour depuis la base dans la minute.

Bascule du domaine (ancien WordPress → nouveau site) : `docs/bascule.md`.
