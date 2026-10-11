# CLAUDE.md — Fondation MIRADEL FEVEPA (refonte de miradel.org)

> Projet réalisé par **Lean Market** (agence de transformation numérique, Kinshasa) pour son client la **Fondation MIRADEL FEVEPA**.
> Langue de travail, du code commenté à l'interface : **français**. Les identifiants de code (variables, tables, fonctions) restent en anglais.

---

## 0. Décisions du 11/10/2026 (priment sur la suite du document)

Demande de Lean Market : **reprendre l'architecture, les outils et le déploiement du projet Mawazo Hair & Beauty** (même équipe, mêmes choix éprouvés sur Hostinger). En conséquence :

- **Base de données : MySQL / MariaDB chez Hostinger (2 Go max), pas Supabase.** ORM **Drizzle** (`src/db/schema.ts`), migrations SQL dans `db/migrations/` (`npm run db:generate`), copiées dans `src/db/migrations.generated.ts` et **appliquées automatiquement au démarrage** (`src/instrumentation.ts` → `src/db/bootstrap.ts`), qui remplit aussi une base vide (`src/db/seed-data.ts`). Champs JSON stockés en `longtext`.
- **Sécurité** : pas de RLS sous MySQL. Toute lecture publique passe par `src/lib/data/public.ts` (filtre « publié ») ; toute écriture admin passe par une action serveur qui appelle `requireUser()` ; les envois publics passent par `src/app/api/*` (Zod + limitation de débit + champ piège + délai minimal, `src/lib/antispam.ts`).
- **Authentification maison** (comme Mawazo) : sessions en base (empreinte SHA-256), cookie `httpOnly` 30 jours, bcrypt, limitation des tentatives ; premier compte créé avec le code de première connexion Lean Market. Réinitialisation du mot de passe par la responsable ou Lean Market (écran Utilisateurs) ; pas d'e-mail en phase 1.
- **Hébergement : Hostinger « Node.js Web App », domaine `miradel.org`.** Build **webpack** (`next build --webpack`). Images et PDF sur le disque, dossier `UPLOAD_DIR` hors de l'application, servis par `/media/...`.
- **Ports** : dev 3420, tests Playwright 3421, MariaDB Docker locale 3308. En production, `PORT` vient de Hostinger.
- **Variables d'environnement** : `.env.example` (modèle versionné), `.env.local` (LOCAL), `.env.hostinger` (PC → base Hostinger), `.env.production` (à importer dans hPanel) ; `APP_ENV` les distingue dans les journaux.
- **Admin** : composants maison (`src/components/admin/`) au lieu de shadcn/ui ; réordonnancement par flèches (plus fiable au doigt que le glisser-déposer) ; Markdown simple pour les textes longs.
- **Prix à confirmer** : `products.price_amount` peut être vide → « Prix à confirmer » + « Demander le prix sur WhatsApp » ; un tel produit ne peut pas entrer dans le panier.
- **Next.js 16** avec Cache Components : données en `'use cache'` + `cacheTag`, invalidées par `updateTag` dans les actions de l'admin ; tout `new Date()` rendu à la requête est précédé de `await connection()`.
- Charte (vert profond, ocre, crème ; Fraunces + Manrope) et logo texte : **propositions à valider**.

---

## 1. Contexte

**Client :** Fondation MIRADEL FEVEPA, République Démocratique du Congo.
**Mission affichée :** autonomiser les femmes et les jeunes vulnérables en RDC par des actions concrètes et durables.
**Double activité du site :**
1. **Vitrine institutionnelle** : présentation, programmes, impact, transparence, actualités, engagement (dons, bénévolat, partenariats).
2. **Boutique solidaire** : vente de produits locaux fabriqués dans le cadre des programmes (agro-alimentaire, hygiène).

**Coordonnées actuelles :** e-mail `sylviekashama@gmail.com`, téléphone et WhatsApp +243 811 708 299, page Facebook `facebook.com/profile.php?id=61586886501323`.
Les liens Instagram et TikTok de l'ancien site pointent vers les pages d'accueil des réseaux (aucun compte réel) : **à fournir par le client ou à retirer**.

**Site actuel :** https://miradel.org/ — WordPress généré par IA + WooCommerce. Problèmes : design faible et générique, maintenance difficile, contenus très minces, plusieurs erreurs (voir ci-dessous).

### Contenus existants

**Pages :** Accueil, La Fondation, Nos Programmes, Notre Impact, Transparence, Nos Produits, Commander, S'engager, Actualités, Contact, Conditions Générales, Mon compte, Panier, Paiement.

**Programmes cités :** Agriculture durable ; Santé communautaire (cliniques mobiles) ; Éducation inclusive ; Protection environnementale (emplois verts). L'hygiène apparaît aussi comme domaine d'action. **Aucun lieu d'intervention, aucun chiffre, aucun bénéficiaire n'est précisé** : à obtenir du client.

**Produits (catégories Agro-alimentaire et Hygiène) :**

| Produit | Prix affiché sur l'ancien site |
|---|---|
| Concentré de Piment | « Fr 7,00 » |
| Désinfectant Bactérol | « Fr 8,00 » |
| Détergent Multi-Usage | « Fr 6,00 » |
| Piment Séché | « Fr 5,00 » |
| Yaourt Naturel | « Fr 3,00 » |

> ⚠️ **Ces prix sont manifestement faux** : 3 à 8 francs congolais ne correspondent à aucun prix réel. Il s'agit probablement de dollars américains ou de milliers de FC mal saisis. **Ne pas les reprendre.** Les charger avec `[PRIX À CONFIRMER]` et faire valider prix, devise, contenance et conditionnement de chaque produit par le client.

**Erreurs de l'ancien site à ne pas reproduire :**
- Le bouton « Voir » de la carte Hygiène renvoie vers les Conditions Générales ; celui de la carte Agro-alimentaire vers l'accueil.
- Formulaire d'inscription à la newsletter non fonctionnel.
- Lien vers la politique de confidentialité vide dans le formulaire de contact.
- Page Transparence sans aucun document ni référence, illustrée par un rapport daté de 2016 — **contre-productif pour une fondation**.
- Images de banques d'images, dont une photo du Kigali Convention Centre (Rwanda) sur une page d'une fondation congolaise.
- Aucun nom de responsable, aucune adresse physique, aucun statut juridique affiché.

---

## 2. Objectifs de la refonte

1. **Crédibilité** : une fondation vit de la confiance. Le site doit montrer qui dirige, où la fondation agit, ce qu'elle a fait (chiffres, photos réelles, actualités datées) et publier ses documents (statuts, agréments, rapports).
2. **Indépendance** : code source dans un dépôt Git appartenant au client (ou à Lean Market pour son compte), sans constructeur de site ni abonnement nécessaire pour modifier le contenu.
3. **Autonomie de l'équipe de la fondation** : un tableau de bord d'administration en français, utilisable sur téléphone, pour gérer produits, prix, promotions, réductions, programmes, actualités, chiffres d'impact, documents et images.
4. **Ventes et soutiens via WhatsApp et mobile money**, adaptés aux usages congolais.
5. **Préserver le référencement** de miradel.org grâce aux redirections (voir §11).

---

## 3. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Framework | **Next.js** (App Router, dernière version stable) + **TypeScript** strict | Rendu serveur, SEO, routes admin et API dans un seul projet |
| Style | **Tailwind CSS** | Design system maîtrisé, CSS minimal |
| Composants admin | **shadcn/ui** | Composants accessibles, code dans le projet |
| Base de données, authentification, stockage | **Supabase** (PostgreSQL + Auth + Storage) | Postgres standard, exportable ; stockage des images et des PDF |
| Validation | **Zod** | Schémas partagés formulaire ↔ serveur |
| Formulaires | react-hook-form | |
| Contenus longs | Markdown (éditeur simple avec aperçu dans l'admin) | Portable, pas de format propriétaire |
| Tests | Vitest (logique métier), Playwright (parcours critiques) | |
| Hébergement | À arrêter (voir §12) | |

**Règles :**
- Utiliser `npm`. Version de Next.js : stable au moment de l'initialisation, figée dans `package.json`.
- Pas de WordPress, pas de CMS tiers : l'admin est développé sur mesure dans `/admin`.
- Pas de comptes clients en phase 1 (la page « Mon compte » disparaît) : un acheteur ou un donateur ne crée pas de compte, il laisse son nom et son téléphone.
- Toute la logique de prix et de promotion vit dans `src/lib/pricing/` et est **couverte par des tests**.

---

## 4. Arborescence cible

```
src/
  app/
    (public)/
      page.tsx                    # Accueil
      la-fondation/               # Mission, histoire, gouvernance, équipe
      nos-programmes/             # Liste + page par programme (/nos-programmes/[slug])
      notre-impact/               # Chiffres clés, témoignages, photos
      transparence/               # Statuts, agréments, rapports téléchargeables
      boutique/                   # Catalogue (/boutique) + catégories (/boutique/c/[slug])
      produits/[slug]/            # Fiche produit
      panier/
      sengager/                   # Don, bénévolat, partenariat
      actualites/                 # Liste + article (/actualites/[slug])
      contact/
      conditions-generales/
      politique-de-confidentialite/
    admin/
      (auth)/connexion/
      (dashboard)/
        page.tsx                  # Commandes à traiter, dons déclarés, messages
        commandes/
        dons/
        messages/                 # Formulaire de contact, bénévolat, partenariat
        produits/
        categories/
        promotions/
        programmes/
        impact/                   # Chiffres clés
        actualites/
        documents/                # Transparence
        equipe/
        partenaires/
        pages/                    # Textes et images des sections fixes
        abonnes/                  # Newsletter (liste + export CSV)
        parametres/
        utilisateurs/
    api/
  components/{public,admin,ui}/
  lib/
    supabase/
    pricing/
    whatsapp.ts
    format.ts
supabase/
  migrations/
  seed.sql
```

Les chemins des pages institutionnelles reprennent ceux de l'ancien site pour limiter les redirections.

---

## 5. Modèle de données (Supabase / PostgreSQL)

Toutes les tables ont `id uuid`, `created_at`, `updated_at`. Montants en **entiers** (`amount integer`) avec `currency text check (currency in ('CDF','USD'))` ; FC sans décimales, USD en cents. Jamais de `float` pour l'argent.

**Configuration et contenus fixes**
- **settings** (ligne unique) : nom, sigle, slogan, statut juridique, numéro d'enregistrement / agrément, adresse du siège, e-mail, téléphone, numéro WhatsApp, réseaux sociaux, devise par défaut, **coordonnées de paiement mobile money et bancaires** (pour la boutique et les dons), taux USD/CDF indicatif saisi à la main (jamais récupéré automatiquement).
- **page_sections** : clé, titre, texte, image, libellé et lien du bouton (héro de l'accueil, mission, appel au don…).

**Institutionnel**
- **programs** : titre, slug, résumé, contenu (Markdown), image de couverture, galerie, zones d'intervention (texte), bénéficiaires visés, statut (`en_cours` | `termine` | `en_preparation`), ordre, `is_published`.
- **impact_metrics** : libellé (« femmes formées »), valeur, unité, période ou date de référence, **source / justification** (champ interne obligatoire), programme lié, ordre, `is_published`.
- **posts** (actualités) : titre, slug, extrait, contenu, image, programme lié, `published_at`, SEO.
- **documents** (transparence) : titre, type (`statuts` | `agrement` | `rapport_activite` | `rapport_financier` | `autre`), année, fichier PDF (Storage), description, `is_published`.
- **team_members** : nom, fonction, photo, courte biographie, ordre, `is_published`.
- **partners** : nom, logo, lien, ordre, `is_published`.
- **testimonials** : nom affiché, texte, programme lié, `consent_obtained boolean` (obligatoire à `true` pour publier), `is_published`.

**Boutique**
- **product_categories** : nom, slug, description, image, ordre (Agro-alimentaire, Hygiène au départ).
- **products** : catégorie, nom, slug, description, contenance / conditionnement, `price_amount`, `currency`, `compare_at_amount` (prix barré), stock (nullable = non suivi), images ordonnées, programme d'origine (« fabriqué par les bénéficiaires du programme… »), `is_published`, `is_featured`.
- **promotions** : titre, description, bannière, `discount_type` (`percentage` | `fixed_amount` | `display_only`), `discount_value`, `scope` (`all_products` | `product_category` | `items`), cibles (`promotion_targets`), `starts_at`, `ends_at`, `weekdays smallint[]`, `min_quantity` (réduction par quantité, facultatif), `is_active`, `show_banner`, `priority`.
- **orders** + **order_items** : nom, téléphone, commune / adresse de livraison ou retrait, lignes avec prix unitaire et réduction **figés au moment de la commande**, total, `payment_method` (`mobile_money` | `cash_livraison` | `virement` | `sur_place`), `payment_reference`, `status` (`nouvelle` | `confirmée` | `payée` | `livrée` | `annulée`), note interne.

**Engagement**
- **donations** (déclarations de don) : nom (ou anonyme), téléphone, e-mail facultatif, montant, devise, moyen utilisé, référence de transaction, programme soutenu (facultatif), `status` (`déclaré` | `confirmé` | `rejeté`). Le site **enregistre une déclaration** ; c'est l'équipe qui confirme la réception.
- **contact_messages** : type (`contact` | `benevolat` | `partenariat`), nom, téléphone, e-mail, organisation, message, statut de traitement.
- **newsletter_subscribers** : e-mail, date, consentement, `unsubscribed_at`. L'envoi de lettres d'information est hors périmètre de la phase 1 (export CSV depuis l'admin).

**Système**
- **profiles** : lié à `auth.users`, `role` (`owner` | `editor` | `lean_admin`).
- **audit_log** : table, id, action, utilisateur, horodatage, valeurs avant/après.

**Sécurité (RLS obligatoire sur toutes les tables) :**
- Lecture publique uniquement des contenus publiés et des promotions actives.
- `orders`, `donations`, `contact_messages`, `newsletter_subscribers` : insertion uniquement via des routes serveur validées par Zod, avec limitation de débit et protection anti-spam (champ piège + délai minimal de remplissage ; pas de CAPTCHA lourd) ; lecture réservée aux rôles admin.
- Gestion des utilisateurs : `owner` et `lean_admin`. La clé `service_role` ne quitte jamais le serveur.

---

## 6. Règles de prix et de promotions

Fonction unique : `getEffectivePrice(product, quantity, promotions, date)` dans `src/lib/pricing/`.

1. Promotions actives : `is_active`, dans la période `starts_at`–`ends_at`, jour de la semaine compris dans `weekdays` si renseigné, `quantity >= min_quantity` si renseigné. **Fuseau `Africa/Kinshasa`.**
2. Ne garder que celles dont la portée couvre le produit.
3. **Pas de cumul** : la promotion donnant le prix le plus bas l'emporte, puis la `priority` la plus haute. (Règle par défaut — à confirmer.)
4. Prix jamais négatif. Arrondi en FC à la centaine inférieure — **à confirmer**.
5. `display_only` : bannière et page dédiée, sans effet sur le prix.

Prix affiché, prix du panier, prix du message WhatsApp et prix enregistré dans la commande : **même fonction, exécutée côté serveur**. Tests obligatoires (promotion expirée, jour de semaine, seuil de quantité, deux promotions concurrentes, montant fixe supérieur au prix, minuit à Kinshasa).

---

## 7. Commandes et dons : le tunnel WhatsApp + mobile money

**Aucune passerelle de paiement en ligne en phase 1.** Le paiement par carte est marginal en RDC ; le mobile money domine. Une intégration d'agrégateur mobile money pourra être étudiée plus tard.

**Commande boutique :**
1. Panier dans `localStorage` (lecture/écriture sous `try/catch`).
2. Formulaire : nom, téléphone (formats `08…`, `+243…`, `243…` normalisés en `+243XXXXXXXXX`), livraison ou retrait, commune / adresse, moyen de paiement.
3. Enregistrement dans `orders` → ouverture de `wa.me/<numéro des settings>` avec un récapitulatif lisible (articles, quantités, total en devise, référence courte).
4. **Si l'enregistrement échoue, ouvrir quand même WhatsApp** avec le récapitulatif : aucune vente perdue pour une coupure réseau.
5. Page de confirmation : numéros mobile money (depuis `settings`), référence à indiquer dans le paiement, délai de confirmation.

**Don :**
1. Page « S'engager › Faire un don » : explication de l'usage des fonds, montants suggérés (configurables dans l'admin, **à fournir par le client**), coordonnées mobile money et bancaires.
2. Formulaire de déclaration de don (montant, moyen, référence de transaction, nom ou anonyme) → `donations` → message de remerciement + lien WhatsApp.
3. L'équipe confirme le don dans l'admin.
4. **Ne jamais promettre** de reçu fiscal ou de déductibilité : le régime applicable dépend du statut juridique de la fondation, non communiqué à ce jour.

---

## 8. Tableau de bord d'administration (`/admin`)

**Utilisateurs cibles :** l'équipe de la fondation, non technicienne, souvent sur téléphone, avec connexion instable et données payantes.

**Principes d'ergonomie :**
- Mobile d'abord, formulaires sur une colonne, boutons larges.
- Vocabulaire simple : « Publier », « Masquer », « Mettre en avant ». Slugs générés automatiquement.
- Aperçu « Voir sur le site » ; « Masquer » privilégié à « Supprimer » ; confirmation avant toute suppression.
- **Compression des images dans le navigateur avant envoi** (largeur max 1600 px, WebP, ~200 Ko). PDF limités à 10 Mo, avec avertissement au-delà de 3 Mo.
- Glisser-déposer pour l'ordre des produits, programmes, chiffres, photos.
- En cas d'échec réseau : conserver la saisie, proposer de réessayer.
- Après chaque enregistrement : revalidation des pages publiques concernées (`revalidatePath` / `revalidateTag`).

**Écrans :**
1. **Accueil admin** : commandes à traiter, dons déclarés à confirmer, messages non lus, promotions actives, raccourcis.
2. **Commandes** : liste filtrable, changement de statut, référence de paiement, bouton « Répondre sur WhatsApp ».
3. **Dons** : confirmation / rejet, total confirmé par mois et par devise (pas de conversion automatique entre devises).
4. **Messages** (contact, bénévolat, partenariat).
5. **Produits** et **Catégories** : prix, devise, prix barré, contenance, stock, images, publication, mise en avant.
6. **Promotions et réductions** : assistant en étapes (type → portée → période / jours / quantité minimale → bannière) avec aperçu du prix avant/après.
7. **Programmes**, **Actualités**, **Chiffres d'impact** (champ « source » obligatoire), **Documents** (téléversement PDF), **Équipe**, **Partenaires**, **Témoignages** (consentement obligatoire).
8. **Contenus des pages** : héro de l'accueil, textes de mission, appels à l'action.
9. **Abonnés newsletter** : liste, export CSV.
10. **Paramètres** : coordonnées, WhatsApp, réseaux sociaux, coordonnées de paiement, montants de don suggérés.
11. **Utilisateurs** (owner et lean_admin).

**Authentification :** Supabase Auth, e-mail + mot de passe, réinitialisation par e-mail. Un compte `lean_admin` permet à Lean Market d'assurer la maintenance sans utiliser les identifiants de la fondation.

---

## 9. Direction artistique

L'ancien design est jugé raté : **ne pas s'en inspirer**.

- Ton : humain, chaleureux, digne et sérieux. Une fondation crédible, pas une boutique en ligne avec une page « à propos ».
- **Palette et typographie : à valider avec le client** (aucune charte fournie, logo à demander). Proposition de départ à soumettre : tons terre et végétal (vert profond, ocre, crème), une police de titre affirmée et une sans-serif très lisible. Couleurs définies une seule fois en variables pour pouvoir changer de charte en un point.
- **Photos réelles uniquement** : bénéficiaires, ateliers de fabrication, champs, actions de terrain, équipe. Aucune image de banque d'images présentant de faux bénéficiaires ou des lieux hors RDC.
- **Droit à l'image :** les personnes photographiées, surtout des femmes et des jeunes en situation de vulnérabilité, doivent avoir donné leur accord ; pour les mineurs, l'accord d'un parent ou tuteur. Prévoir dans l'admin une case « autorisation de diffusion obtenue » sur les galeries et les témoignages. Privilégier des images qui valorisent les personnes (au travail, en réussite) plutôt que des images misérabilistes.
- Les produits ont de vraies fiches : photo nette sur fond neutre, contenance, ingrédients ou composition, conseils d'utilisation, programme d'origine.
- Contrastes WCAG AA, zones tactiles ≥ 44 px, bouton WhatsApp flottant sur toutes les pages publiques.
- Avant l'intégration, produire et faire valider une maquette de l'accueil (desktop + mobile).

---

## 10. Contraintes RDC : performance et sobriété

- Page d'accueil **< 500 Ko transférés** au premier chargement mobile ; LCP < 2,5 s en 4G simulée.
- Images WebP/AVIF, `sizes` corrects, chargement différé ; aucune vidéo en lecture automatique.
- 2 familles de polices maximum, auto-hébergées, `font-display: swap`.
- Pages publiques générées statiquement (ISR).
- Montants affichés `5 000 FC` / `12,50 USD`, devise toujours visible. Dates en français, fuseau `Africa/Kinshasa`.
- Documents PDF : taille affichée à côté du lien de téléchargement.

---

## 11. Migration depuis WordPress et SEO

- **Avant toute bascule**, Lean Market exporte depuis l'ancien WordPress : export XML (pages, articles), export CSV des produits WooCommerce, médiathèque, commandes éventuelles et inscrits. Ces fichiers sont placés dans `migration/source/` (non versionné) ; un script `scripts/import-wordpress.ts` alimente la nouvelle base. Ne pas inventer de contenu manquant.
- **Redirections 301** (dans `next.config` ou le middleware) :
  - `/product/<slug>/` → `/produits/<slug>`
  - `/nos-produits/`, `/shop/`, `/commander/` → `/boutique`
  - `/accueil/` → `/boutique/c/agro-alimentaire` (ancien lien de la carte Agro-alimentaire — à vérifier)
  - `/mon-compte/`, `/paiement/` → `/panier`
  - toutes les autres anciennes URL relevées dans l'export → équivalent le plus proche
- **Nom de domaine `miradel.org`** : vérifier qui détient l'accès au registraire avant de commencer. Relever les enregistrements DNS existants (notamment MX si une messagerie utilise le domaine) avant de modifier quoi que ce soit.
- Métadonnées par page, image Open Graph 1200×630 (aperçu affiché dans WhatsApp), données structurées `NGO` (Organization) et `Product`, `sitemap.xml`, `robots.txt`.
- Politique de confidentialité réelle (formulaires, newsletter, dons) — **texte à faire valider ; ne pas publier de mentions juridiques inventées**.

---

## 12. Hébergement et propriété — décisions à confirmer

- **Hébergement :** à arbitrer par Lean Market selon le budget — Vercel (offre gratuite réservée à un usage non commercial ; la boutique en fait un usage commercial), Netlify, Cloudflare, ou VPS avec Node. Le code reste déployable partout : aucune fonctionnalité propriétaire d'un hébergeur.
- **Supabase :** les projets gratuits sont mis en pause après une période d'inactivité ; pour la production, prévoir l'offre payante ou une solution de maintien d'activité. Sauvegardes exportées régulièrement.
- Comptes (domaine, hébergement, Supabase, Git) au nom de la fondation avec Lean Market en collaborateur, ou au nom de Lean Market avec transfert prévu au contrat — décision commerciale de Lean Market.
- **Adresse e-mail :** la fondation utilise une adresse Gmail personnelle. Recommander une adresse sur le domaine (`contact@miradel.org`) — crédibilité. Hors périmètre du code, à signaler.

---

## 13. Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # serveur uniquement
NEXT_PUBLIC_SITE_URL=https://miradel.org
```
Fournir `.env.example`. Ne jamais committer `.env.local`.

---

## 14. Commandes

```
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run import:wordpress          # script de migration
npx supabase migration new <nom>
```

---

## 15. Ordre de travail

1. Initialiser le projet (TypeScript strict, ESLint, Prettier, Tailwind), `.env.example`.
2. Migrations Supabase + RLS + `seed.sql` (contenus de §1, prix marqués `[PRIX À CONFIRMER]`).
3. `src/lib/pricing` + tests.
4. Script d'import WordPress (dès que les exports sont disponibles).
5. Maquette de l'accueil (desktop + mobile) → **validation par Lean Market avant de continuer**.
6. Pages publiques institutionnelles, puis boutique.
7. Authentification et admin, dans l'ordre : Paramètres → Produits → Promotions → Commandes → Programmes → Actualités → Impact → Documents → Dons → Messages → Équipe / Partenaires → Contenus des pages.
8. Tunnels commande et don + tests Playwright.
9. Redirections 301, SEO, performance (Lighthouse mobile), accessibilité.
10. Guide d'utilisation de l'admin (`docs/guide-admin.md`, français simple, captures).
11. Liste de bascule DNS (`docs/bascule.md`).

---

## 16. Règles de conduite pour Claude Code

- **Ne jamais inventer** un prix, un chiffre d'impact, un nom de responsable, un numéro d'agrément, un numéro mobile money, un témoignage ou un texte juridique. Utiliser `[À COMPLÉTER]` visible et tenir à jour `docs/a-completer.md`.
- Signaler toute incohérence trouvée dans les contenus importés (prix, devises, liens, dates).
- Une migration = un fichier SQL ; ne jamais modifier une migration appliquée.
- Avant de terminer une tâche : `npm run lint && npm run typecheck && npm run test`.
- Commits courts en français, à l'impératif.
- Toute décision structurante non prévue ici (nouvelle dépendance, service tiers payant, paiement en ligne, changement de modèle de données) : demander avant.
