CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"position_title" text NOT NULL,
	"status" text DEFAULT 'applied' NOT NULL,
	"applied_at" date,
	"job_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_applications_company_name_length_check" CHECK (char_length("job_applications"."company_name") between 1 and 200),
	CONSTRAINT "job_applications_position_title_length_check" CHECK (char_length("job_applications"."position_title") between 1 and 200),
	CONSTRAINT "job_applications_status_check" CHECK ("job_applications"."status" in ('wishlist', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
	CONSTRAINT "job_applications_job_url_length_check" CHECK ("job_applications"."job_url" is null or char_length("job_applications"."job_url") <= 2048),
	CONSTRAINT "job_applications_notes_length_check" CHECK ("job_applications"."notes" is null or char_length("job_applications"."notes") <= 5000)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_length_check" CHECK (char_length("sessions"."token_hash") = 64)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"username_normalized" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_length_check" CHECK (char_length("users"."username") between 3 and 30),
	CONSTRAINT "users_username_normalized_length_check" CHECK (char_length("users"."username_normalized") between 3 and 30),
	CONSTRAINT "users_username_normalized_format_check" CHECK ("users"."username_normalized" ~ '^[a-z0-9_]+$')
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_applications_user_created_at_idx" ON "job_applications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "job_applications_user_status_idx" ON "job_applications" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_uidx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_normalized_uidx" ON "users" USING btree ("username_normalized");