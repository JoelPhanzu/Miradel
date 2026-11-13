-- La fondation devient la première « vitrine » : ses produits existants lui sont rattachés.
-- (Sur une base neuve, settings est encore vide ici : le remplissage initial s'en charge.)
INSERT INTO `entrepreneurs` (`id`, `name`, `slug`, `is_foundation`, `is_published`, `is_featured`, `position`)
SELECT UUID(), `organization_name`, 'fondation-miradel-fevepa', 1, 1, 1, 0 FROM `settings` WHERE `id` = 1;
--> statement-breakpoint
UPDATE `products` SET `entrepreneur_id` = (SELECT `id` FROM `entrepreneurs` WHERE `is_foundation` = 1 LIMIT 1)
WHERE `entrepreneur_id` IS NULL;
--> statement-breakpoint
-- « Vitrine de l'entrepreneur » remplace « Boutique solidaire » (textes restés à leur valeur de départ).
UPDATE `page_sections` SET `title` = 'Vitrine de l’entrepreneur',
  `body` = 'Les produits de la fondation et des entrepreneurs qu’elle accompagne.'
WHERE `key` IN ('home_shop', 'shop_intro') AND `title` = 'Boutique solidaire';
--> statement-breakpoint
UPDATE `page_sections` SET `button_label` = 'Voir la vitrine' WHERE `key` = 'home_shop' AND `button_label` = 'Voir la boutique';
--> statement-breakpoint
UPDATE `page_sections` SET `button_href` = '/vitrine' WHERE `button_href` = '/boutique';
--> statement-breakpoint
UPDATE `promotions` SET `cta_href` = '/vitrine' WHERE `cta_href` = '/boutique';
--> statement-breakpoint
UPDATE `promotions` SET `cta_label` = 'Voir la vitrine' WHERE `cta_label` = 'Voir la boutique';
--> statement-breakpoint
UPDATE `page_sections` SET `body` = 'Les offres en cours de la vitrine de l’entrepreneur.'
WHERE `key` = 'promotions_intro' AND `body` = 'Les offres en cours de la boutique solidaire.';
--> statement-breakpoint
-- Nouvelle accroche demandée par la fondation (seulement si le titre de départ n'a pas été modifié).
UPDATE `page_sections` SET `title` = 'Autonomiser les femmes et les jeunes en leur apprenant *un métier*'
WHERE `key` = 'home_hero' AND `title` = 'Autonomiser les femmes et les jeunes *vulnérables* en RDC';
--> statement-breakpoint
INSERT IGNORE INTO `page_sections` (`id`, `key`, `title`, `body`) VALUES
  (UUID(), 'home_values', 'Nos valeurs et principes d’action', NULL),
  (UUID(), 'vitrine_entrepreneurs_intro', 'Les entrepreneurs que nous accompagnons', NULL),
  (UUID(), 'vitrine_products_intro', 'Tous les produits', NULL);
