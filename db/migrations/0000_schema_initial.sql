CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL,
	`table_name` varchar(64) NOT NULL,
	`record_id` varchar(36),
	`action` varchar(10) NOT NULL,
	`user_id` varchar(36),
	`old_values` longtext,
	`new_values` longtext,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` varchar(36) NOT NULL,
	`kind` varchar(12) NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`phone` varchar(16),
	`email` varchar(191),
	`organization` varchar(160),
	`message` text NOT NULL,
	`status` varchar(10) NOT NULL DEFAULT 'nouveau',
	`internal_note` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`type` varchar(20) NOT NULL,
	`year` int,
	`file_url` varchar(500) NOT NULL,
	`file_size_bytes` int NOT NULL,
	`description` varchar(400),
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(12) NOT NULL,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`donor_name` varchar(120),
	`donor_phone` varchar(16) NOT NULL,
	`donor_email` varchar(191),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`payment_method` varchar(16) NOT NULL,
	`transaction_reference` varchar(80),
	`program_id` varchar(36),
	`message` text,
	`status` varchar(10) NOT NULL DEFAULT 'déclaré',
	`internal_note` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`),
	CONSTRAINT `donations_reference_unique` UNIQUE(`reference`),
	CONSTRAINT `donations_amount_positive` CHECK(`amount` > 0)
);
--> statement-breakpoint
CREATE TABLE `impact_metrics` (
	`id` varchar(36) NOT NULL,
	`label` varchar(160) NOT NULL,
	`value` int NOT NULL,
	`unit` varchar(40),
	`period` varchar(80),
	`source` text NOT NULL,
	`program_id` varchar(36),
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `impact_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(36) NOT NULL,
	`path` varchar(255) NOT NULL,
	`mime_type` varchar(50) NOT NULL,
	`width` int,
	`height` int,
	`size_bytes` int NOT NULL,
	`alt` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`consent` boolean NOT NULL DEFAULT false,
	`unsubscribed_at` datetime,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`product_name` varchar(120) NOT NULL,
	`variant` longtext NOT NULL,
	`quantity` int NOT NULL,
	`unit_price_amount` int NOT NULL,
	`discount_amount` int NOT NULL DEFAULT 0,
	`promotion_id` varchar(36),
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(12) NOT NULL,
	`customer_name` varchar(120) NOT NULL,
	`customer_phone` varchar(16) NOT NULL,
	`delivery_mode` varchar(10) NOT NULL DEFAULT 'livraison',
	`delivery_commune` varchar(80),
	`delivery_address` varchar(255),
	`total_amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`payment_method` varchar(16) NOT NULL,
	`payment_reference` varchar(80),
	`status` varchar(12) NOT NULL DEFAULT 'nouvelle',
	`message` text,
	`internal_note` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` varchar(36) NOT NULL,
	`key` varchar(60) NOT NULL,
	`title` varchar(200),
	`subtitle` varchar(300),
	`body` text,
	`image_url` varchar(500),
	`secondary_image_url` varchar(500),
	`button_label` varchar(60),
	`button_href` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `page_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_sections_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`logo_url` varchar(500),
	`website_url` varchar(500),
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`excerpt` varchar(300),
	`content` text,
	`image_url` varchar(500),
	`program_id` varchar(36),
	`published_at` datetime,
	`seo_title` varchar(200),
	`seo_description` varchar(300),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` varchar(400),
	`image_url` varchar(500),
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`packaging` varchar(120),
	`composition` text,
	`usage_tips` text,
	`price_amount` int,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`compare_at_amount` int,
	`stock` int,
	`variants` longtext NOT NULL,
	`images` longtext NOT NULL,
	`program_id` varchar(36),
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_price_positive` CHECK(`price_amount` IS NULL OR `price_amount` >= 0)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` varchar(36) NOT NULL,
	`title` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`summary` varchar(400),
	`content` text,
	`cover_image_url` varchar(500),
	`gallery` longtext NOT NULL,
	`gallery_consent` boolean NOT NULL DEFAULT false,
	`areas` varchar(400),
	`beneficiaries` varchar(400),
	`status` varchar(16) NOT NULL DEFAULT 'en_cours',
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `programs_id` PRIMARY KEY(`id`),
	CONSTRAINT `programs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `promotion_targets` (
	`id` varchar(36) NOT NULL,
	`promotion_id` varchar(36) NOT NULL,
	`target_type` varchar(20) NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `promotion_targets_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotion_targets_unique` UNIQUE(`promotion_id`,`target_type`,`target_id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` varchar(36) NOT NULL,
	`title` varchar(120) NOT NULL,
	`subtitle` varchar(200),
	`description` text,
	`badge` varchar(40),
	`banner_url` varchar(500),
	`discount_type` varchar(20) NOT NULL,
	`discount_value` int NOT NULL DEFAULT 0,
	`scope` varchar(20) NOT NULL,
	`starts_at` datetime,
	`ends_at` datetime,
	`weekdays` longtext,
	`min_quantity` int,
	`cta_label` varchar(40),
	`cta_href` varchar(255),
	`is_active` boolean NOT NULL DEFAULT false,
	`show_banner` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 0,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int NOT NULL DEFAULT 1,
	`organization_name` varchar(160) NOT NULL,
	`acronym` varchar(40),
	`tagline` varchar(255),
	`legal_status` varchar(160),
	`registration_number` varchar(120),
	`address` varchar(255),
	`google_maps_url` varchar(500),
	`phone` varchar(20),
	`whatsapp_number` varchar(20) NOT NULL,
	`emails` longtext NOT NULL,
	`social_links` longtext NOT NULL,
	`payment_numbers` longtext NOT NULL,
	`bank_details` text,
	`donation_amounts` longtext NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`usd_to_cdf_rate` int,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` varchar(36) NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`role` varchar(120) NOT NULL,
	`photo_url` varchar(500),
	`bio` text,
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(36) NOT NULL,
	`display_name` varchar(80) NOT NULL,
	`body` text NOT NULL,
	`program_id` varchar(36),
	`consent_obtained` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`),
	CONSTRAINT `testimonials_consent` CHECK(`is_published` = 0 OR `consent_obtained` = 1)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'editor',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `impact_metrics` ADD CONSTRAINT `impact_metrics_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_product_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_targets` ADD CONSTRAINT `promotion_targets_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_log_record_idx` ON `audit_log` (`table_name`,`record_id`);--> statement-breakpoint
CREATE INDEX `contact_messages_status_idx` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `donations_status_idx` ON `donations` (`status`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);