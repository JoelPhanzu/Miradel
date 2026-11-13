CREATE TABLE `entrepreneurs` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`owner_name` varchar(120),
	`sector_id` varchar(36),
	`program_id` varchar(36),
	`tagline` varchar(300),
	`story` text,
	`location` varchar(160),
	`photo_url` varchar(500),
	`photo_consent` boolean NOT NULL DEFAULT false,
	`cover_image_url` varchar(500),
	`whatsapp_number` varchar(20),
	`facebook_url` varchar(500),
	`is_foundation` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `entrepreneurs_id` PRIMARY KEY(`id`),
	CONSTRAINT `entrepreneurs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `organization_values` (
	`id` varchar(36) NOT NULL,
	`kind` varchar(10) NOT NULL DEFAULT 'valeur',
	`title` varchar(120) NOT NULL,
	`description` varchar(600),
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `organization_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program_form_responses` (
	`id` varchar(36) NOT NULL,
	`form_id` varchar(36) NOT NULL,
	`answers` longtext NOT NULL,
	`fields` longtext NOT NULL,
	`status` varchar(10) NOT NULL DEFAULT 'nouveau',
	`internal_note` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `program_form_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program_forms` (
	`id` varchar(36) NOT NULL,
	`program_id` varchar(36) NOT NULL,
	`title` varchar(160) NOT NULL,
	`intro` text,
	`fields` longtext NOT NULL,
	`closes_at` datetime,
	`success_message` varchar(400),
	`is_published` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `program_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sectors` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` varchar(400),
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `sectors_id` PRIMARY KEY(`id`),
	CONSTRAINT `sectors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `page_sections` ADD `gallery` longtext;--> statement-breakpoint
ALTER TABLE `products` ADD `entrepreneur_id` varchar(36);--> statement-breakpoint
ALTER TABLE `entrepreneurs` ADD CONSTRAINT `entrepreneurs_sector_id_sectors_id_fk` FOREIGN KEY (`sector_id`) REFERENCES `sectors`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entrepreneurs` ADD CONSTRAINT `entrepreneurs_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `program_form_responses` ADD CONSTRAINT `program_form_responses_form_id_program_forms_id_fk` FOREIGN KEY (`form_id`) REFERENCES `program_forms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `program_forms` ADD CONSTRAINT `program_forms_program_id_programs_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `program_form_responses_form_idx` ON `program_form_responses` (`form_id`);--> statement-breakpoint
CREATE INDEX `program_forms_program_idx` ON `program_forms` (`program_id`);--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_entrepreneur_id_entrepreneurs_id_fk` FOREIGN KEY (`entrepreneur_id`) REFERENCES `entrepreneurs`(`id`) ON DELETE set null ON UPDATE no action;