-- Le nom complet « Vitrine de l'entrepreneur » partout (boutons restés à leur valeur de départ).
UPDATE `page_sections` SET `button_label` = 'Voir la Vitrine de l’entrepreneur'
WHERE `button_label` = 'Voir la vitrine';
--> statement-breakpoint
UPDATE `promotions` SET `cta_label` = 'Voir la Vitrine de l’entrepreneur'
WHERE `cta_label` = 'Voir la vitrine';
--> statement-breakpoint
UPDATE `page_sections` SET `body` = 'Les offres en cours de la Vitrine de l’entrepreneur.'
WHERE `key` = 'promotions_intro' AND `body` = 'Les offres en cours de la vitrine de l’entrepreneur.';
