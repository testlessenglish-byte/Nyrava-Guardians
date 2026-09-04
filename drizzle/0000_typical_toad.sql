CREATE TABLE `ai_rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_provider_secrets` (
	`provider` text PRIMARY KEY NOT NULL,
	`ciphertext` text NOT NULL,
	`iv` text NOT NULL,
	`last_four` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`validated_at` text NOT NULL,
	`key_version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_secret_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `api_secret_audit_provider_created_idx` ON `api_secret_audit` (`provider`,`created_at`);