CREATE TYPE "public"."arena" AS ENUM('tech_law', 'legal_tech');--> statement-breakpoint
CREATE TYPE "public"."channel" AS ENUM('email', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('verified', 'found', 'pattern', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('internship', 'vacation_scheme', 'scholarship', 'fellowship', 'invitation_programme', 'job', 'clerkship');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('law_firm', 'legal_tech', 'think_tank', 'regulator', 'other');--> statement-breakpoint
CREATE TYPE "public"."sender_status" AS ENUM('connected', 'needs_reconnect', 'removed');--> statement-breakpoint
CREATE TYPE "public"."seniority" AS ENUM('partner', 'associate', 'counsel', 'founder', 'other');--> statement-breakpoint
CREATE TYPE "public"."sequence_mode" AS ENUM('auto', 'review', 'manual');--> statement-breakpoint
CREATE TYPE "public"."sequence_status" AS ENUM('active', 'paused', 'replied', 'exhausted', 'stopped', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."stage" AS ENUM('new', 'queued', 'drafted', 'sent', 'following_up', 'replied', 'meeting', 'closed', 'do_not_contact');--> statement-breakpoint
CREATE TYPE "public"."touch_kind" AS ENUM('first', 'follow_up');--> statement-breakpoint
CREATE TYPE "public"."touch_status" AS ENUM('scheduled', 'drafted', 'awaiting_review', 'sent', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."warm_type" AS ENUM('worked_with', 'alumni', 'alumni_unverified', 'course', 'event', 'none');--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"address" text NOT NULL,
	"status" "email_status" NOT NULL,
	"source_url" text,
	"verifier_result" jsonb,
	"checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"org_id" uuid,
	"org_name" text,
	"type" "opportunity_type" NOT NULL,
	"arena" "arena",
	"location" text,
	"deadline" date,
	"deadline_text" text,
	"url" text NOT NULL,
	"source" text,
	"note" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "org_type" DEFAULT 'other' NOT NULL,
	"website" text,
	"domain" text,
	"city" text,
	"country" text,
	"practice_tags" text[] DEFAULT '{}' NOT NULL,
	"careers_url" text,
	"email_pattern" text,
	"email_pattern_confidence" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"name" text NOT NULL,
	"role" text,
	"seniority" "seniority" DEFAULT 'other' NOT NULL,
	"arena" "arena" NOT NULL,
	"linkedin_url" text,
	"warm_type" "warm_type" DEFAULT 'none' NOT NULL,
	"warm_note" text,
	"hook" text,
	"focus" text,
	"stage" "stage" DEFAULT 'new' NOT NULL,
	"dedupe_key" text NOT NULL,
	"source_urls" text[] DEFAULT '{}' NOT NULL,
	"human_edited_fields" text[] DEFAULT '{}' NOT NULL,
	"cadence_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sender_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_email" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"signature" text,
	"encrypted_refresh_token" text,
	"daily_cap" integer DEFAULT 25 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "sender_status" DEFAULT 'connected' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sender_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"sender_account_id" uuid,
	"mode" "sequence_mode" DEFAULT 'review' NOT NULL,
	"status" "sequence_status" DEFAULT 'active' NOT NULL,
	"cadence_id" text,
	"cadence_snapshot" jsonb,
	"started_at" timestamp with time zone,
	"next_touch_at" timestamp with time zone,
	"touch_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppression" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text,
	"person_id" uuid,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "touches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"channel" "channel" NOT NULL,
	"kind" "touch_kind" NOT NULL,
	"n" integer NOT NULL,
	"scheduled_for" timestamp with time zone,
	"status" "touch_status" DEFAULT 'scheduled' NOT NULL,
	"subject" text,
	"body" text,
	"inventory_refs" text[] DEFAULT '{}' NOT NULL,
	"gmail_draft_id" text,
	"gmail_message_id" text,
	"gmail_thread_id" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_sender_account_id_sender_accounts_id_fk" FOREIGN KEY ("sender_account_id") REFERENCES "public"."sender_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppression" ADD CONSTRAINT "suppression_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "touches" ADD CONSTRAINT "touches_sequence_id_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emails_person_address_idx" ON "emails" USING btree ("person_id","address");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunities_url_idx" ON "opportunities" USING btree ("url");--> statement-breakpoint
CREATE INDEX "organizations_domain_idx" ON "organizations" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "people_dedupe_key_idx" ON "people" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "people_stage_idx" ON "people" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "sequences_next_touch_idx" ON "sequences" USING btree ("status","next_touch_at");--> statement-breakpoint
CREATE INDEX "sequences_person_idx" ON "sequences" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "touches_sequence_idx" ON "touches" USING btree ("sequence_id","n");