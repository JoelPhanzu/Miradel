# Bascule de miradel.org (WordPress → nouveau site)

Le domaine `miradel.org` sert aujourd'hui l'ancien site WordPress. Ne rien modifier avant d'avoir
coché la partie « Avant ».

## Avant

- [ ] Identifier qui détient l'accès au **registraire** du domaine (et au compte Hostinger s'il y est).
- [ ] **Relever tous les enregistrements DNS** existants (capture ou export) : A, AAAA, CNAME,
      **MX** (messagerie), TXT (SPF, DKIM, vérifications Google/Facebook…).
- [ ] Exporter l'ancien WordPress dans `migration/source/` (non versionné) : export XML
      (pages, articles), CSV des produits WooCommerce, médiathèque, commandes, inscrits.
- [ ] Relever toutes les anciennes URL (sitemap WordPress, Search Console) et compléter les
      redirections 301 dans `next.config.ts`.
- [ ] Contenus prioritaires de `docs/a-completer.md` saisis dans l'admin (au minimum : prix ou
      « prix à confirmer » assumé, coordonnées de paiement, textes juridiques validés).
- [ ] Maquette de l'accueil et charte validées.

## Mise en ligne

- [ ] Créer la base MySQL Hostinger et la Node.js Web App (voir `README.md`).
- [ ] Importer `.env.production` (rempli) dans les variables d'environnement.
- [ ] Déployer, vérifier les journaux : `[base] tables créées et contenus de départ ajoutés`.
- [ ] Tester sur l'adresse temporaire Hostinger : accueil, boutique, commande WhatsApp,
      déclaration de don, formulaire de contact, newsletter, `/admin`.
- [ ] Créer le compte de la responsable (code de première connexion) et le compte `lean_admin`.
- [ ] Pointer le domaine `miradel.org` (et `www`) vers la Node.js Web App, **sans toucher aux MX**.
- [ ] Vérifier le certificat HTTPS.

## Après

- [ ] Tester les anciennes URL (`/product/…`, `/nos-produits/`, `/mon-compte/`…) : redirection 301.
- [ ] Déclarer `https://miradel.org/sitemap.xml` dans Google Search Console.
- [ ] Tester l'aperçu d'un lien partagé sur WhatsApp (image Open Graph).
- [ ] Lighthouse mobile sur l'accueil (objectif < 500 Ko, LCP < 2,5 s en 4G).
- [ ] Mettre en place les sauvegardes : export de la base (hPanel) **et** du dossier des photos/PDF.
- [ ] Garder l'ancien WordPress hors ligne (archive) quelques semaines avant suppression.
