# À compléter — informations à obtenir de la Fondation MIRADEL FEVEPA

Tout ce qui suit s'affiche aujourd'hui sur le site sous la forme **« [À COMPLÉTER] »** (surlignée)
ou n'apparaît pas tant que l'information manque. Rien n'a été inventé (CLAUDE.md §16).
Chaque point se saisit ensuite **dans l'admin**, sans intervention technique.

## 1. Identité et crédibilité (priorité haute)

| Information | Où la saisir dans l'admin | État |
|---|---|---|
| Statut juridique (ASBL, fondation…) | Coordonnées et paiement > La fondation | manquant |
| Numéro d'enregistrement / agrément | Coordonnées et paiement > La fondation | manquant |
| Sigle officiel | Coordonnées et paiement > La fondation | manquant |
| Adresse physique du siège | Coordonnées et paiement > La fondation | manquant |
| Responsables (noms, fonctions, photos, accord de diffusion) | Équipe | aucun |
| Histoire de la fondation (date de création, fondatrice…) | Textes et images > La Fondation > Histoire | manquant |
| Gouvernance (conseil, organes) | Textes et images > La Fondation > Gouvernance | manquant |
| Logo officiel (fichier vectoriel ou PNG haute définition) | — (intégration par Lean Market) | manquant : logo texte provisoire |
| Statuts, agréments, rapports d'activité et financiers (PDF) | Documents | aucun |
| Partenaires réels (nom, logo, accord) | Partenaires | aucun |

## 2. Programmes

Pour chacun des 4 programmes (Agriculture durable, Santé communautaire, Éducation inclusive,
Protection environnementale) : **résumé, description, zones d'intervention, bénéficiaires visés,
état (en cours / terminé / en préparation), photos réelles avec autorisation de diffusion**.
L'ancien site citait aussi l'**hygiène** comme domaine d'action : programme à part entière ou non ?

## 3. Impact

Aucun chiffre n'existe sur l'ancien site. Chaque chiffre publié doit avoir une **source**
(rapport, listes de présence…) saisie dans l'admin (champ obligatoire, jamais affiché).
Témoignages : uniquement réels, avec **accord écrit** (parent ou tuteur pour un mineur).

## 4. Boutique

| Produit | Prix | Devise | Contenance / conditionnement | Description, composition, conseils |
|---|---|---|---|---|
| Concentré de Piment | à confirmer | à confirmer | à confirmer | à fournir |
| Désinfectant Bactérol | à confirmer | à confirmer | à confirmer | à fournir |
| Détergent Multi-Usage | à confirmer | à confirmer | à confirmer | à fournir |
| Piment Séché | à confirmer | à confirmer | à confirmer | à fournir |
| Yaourt Naturel | à confirmer | à confirmer | à confirmer | à fournir |

- **Incohérence relevée** : l'ancien site affichait « Fr 3,00 » à « Fr 8,00 », prix impossibles en
  francs congolais (probablement des dollars ou des milliers de FC). **Non repris.** Tant que le prix
  est vide, le produit s'affiche « Prix à confirmer » avec un bouton « Demander le prix sur WhatsApp ».
- **Visuels reçus** (dossier « Fondation MIRADEL FEVEPA », 5 images WhatsApp du 28/07/2026) :
  ce sont des **visuels publicitaires générés par IA** de la gamme « Mira Power Clean », pas des
  photos réelles. Ils présentent des produits **absents de l'ancien site** : Javel (1 L, 2,5 L, 5 L),
  Détergent liquide multi-usage (1 L, 2,5 L, 5 L), Bactérol (1 L, 2,5 L), Savon lessive Mira (250 g).
  Le dernier visuel contient des **fautes sur l'étiquette** (« POWEP », « blane », « SUE EFF.CACE »)
  et l'affiche « élimine 99,9 % des germes » demande une justification. **Non utilisés sur le site.**
  À confirmer : « Mira Power Clean » est-il le nom commercial des produits d'hygiène de la fondation ?
  Faut-il ajouter Javel et Savon lessive ? Prix par contenance (une variante = un même prix
  aujourd'hui ; des contenances à prix différents = des produits distincts) ?
- Photos réelles des produits, nettes sur fond neutre.
- Livraison : communes desservies, frais, délai de confirmation d'une commande.

## 5. Paiements et dons

- Numéros **mobile money** (opérateur, numéro, nom du titulaire) : Coordonnées et paiement.
- **Coordonnées bancaires** pour les virements : Coordonnées et paiement.
- **Montants de don suggérés** (FC et/ou USD) : Coordonnées et paiement.
- Texte « **À quoi sert votre don** » : Textes et images > Faire un don.
- Régime fiscal des dons : **aucun reçu fiscal n'est promis** tant que le statut juridique n'est pas connu.

## 6. Réseaux et contact

- Instagram et TikTok de l'ancien site pointaient vers les pages d'accueil des réseaux (aucun
  compte réel) : **retirés**. Seul Facebook est relié. À fournir s'ils existent.
- Adresse e-mail : la fondation utilise une adresse Gmail personnelle
  (`sylviekashama@gmail.com`). Recommandé : `contact@miradel.org` (hors code).

## 7. Textes juridiques (à faire valider, jamais inventés)

- Conditions générales (vente et utilisation) : Textes et images > Conditions générales.
- Politique de confidentialité (formulaires, dons, commandes, newsletter) :
  Textes et images > Politique de confidentialité.

## 8. Décisions à confirmer

- Charte graphique proposée (vert profond, ocre, crème ; Fraunces + Manrope) et **maquette de
  l'accueil** (desktop + mobile) à valider avant mise en ligne (CLAUDE.md §9 et §15).
- Règles de prix : pas de cumul des promotions ; arrondi des FC à la centaine inférieure.
- Désinscription newsletter : aujourd'hui par message à la fondation (envoi des lettres hors site).

## 9. Migration (CLAUDE.md §11)

- Exports de l'ancien WordPress (XML pages/articles, CSV WooCommerce, médiathèque, inscrits) à
  placer dans `migration/source/` : le script d'import sera écrit à leur réception.
- Liste complète des anciennes URL pour compléter les redirections 301 (`next.config.ts`).
- Accès au registraire de `miradel.org` et relevé des DNS existants (dont MX) : voir `docs/bascule.md`.
