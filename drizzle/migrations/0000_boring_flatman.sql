CREATE TYPE "public"."achievement_type" AS ENUM('QUIZZES_COMPLETED', 'QUIZZES_CREATED', 'STREAK_DAYS', 'PERFECT_SCORES', 'TOTAL_XP');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIMED_OUT');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."moderation_kind" AS ENUM('CREATOR_APPROVED', 'CREATOR_REJECTED', 'CREATOR_REVOKED', 'USER_BANNED', 'USER_UNBANNED', 'QUIZ_HIDDEN', 'QUIZ_SUSPENDED', 'QUIZ_RESTORED', 'QUIZ_DELETED', 'REPORT_DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('SINGLE', 'MULTIPLE', 'TRUE_FALSE');--> statement-breakpoint
CREATE TYPE "public"."quiz_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."quiz_visibility" AS ENUM('PUBLIC', 'UNLISTED', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('NSFW', 'HATE', 'SPAM', 'MISLEADING', 'COPYRIGHT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'DISMISSED', 'ACTIONED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'CREATOR', 'MODERATOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."xp_source" AS ENUM('QUIZ_COMPLETED', 'PERFECT_SCORE', 'STREAK_BONUS', 'ACHIEVEMENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"type" "achievement_type" NOT NULL,
	"threshold" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"xp_reward" integer NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_option_ids" integer[] NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_spent_ms" integer,
	CONSTRAINT "attempt_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"motivation" text NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "creator_applications_motivation_length" CHECK (char_length("creator_applications"."motivation") between 40 and 500)
);
--> statement-breakpoint
CREATE TABLE "moderation_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "moderation_kind" NOT NULL,
	"actor_id" integer,
	"user_id" integer,
	"quiz_id" integer,
	"note" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "moderation_events_has_subject" CHECK ("moderation_events"."user_id" is not null or "moderation_events"."quiz_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"label" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"type" "question_type" DEFAULT 'SINGLE' NOT NULL,
	"title" text NOT NULL,
	"explanation" text,
	"position" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"shuffle_seed" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"time_taken" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_bookmarks" (
	"quiz_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_bookmarks_user_id_quiz_id_pk" PRIMARY KEY("user_id","quiz_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_ratings" (
	"quiz_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_ratings_user_id_quiz_id_pk" PRIMARY KEY("user_id","quiz_id"),
	CONSTRAINT "quiz_ratings_range" CHECK ("quiz_ratings"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "quiz_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"reporter_id" integer NOT NULL,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_reports_details_length" CHECK ("quiz_reports"."details" is null or char_length("quiz_reports"."details") <= 300)
);
--> statement-breakpoint
CREATE TABLE "quiz_tags" (
	"quiz_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "quiz_tags_quiz_id_tag_id_pk" PRIMARY KEY("quiz_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"category_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"status" "quiz_status" DEFAULT 'DRAFT' NOT NULL,
	"visibility" "quiz_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"time_limit_seconds" integer,
	"shuffle_questions" boolean DEFAULT false NOT NULL,
	"shuffle_options" boolean DEFAULT false NOT NULL,
	"max_attempts" integer,
	"published_at" timestamp,
	"suspended_at" timestamp,
	"suspended_by" integer,
	"suspension_reason" text,
	"deleted_at" timestamp,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "quizzes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "quizzes_time_limit_positive" CHECK ("quizzes"."time_limit_seconds" is null or "quizzes"."time_limit_seconds" > 0),
	CONSTRAINT "quizzes_max_attempts_positive" CHECK ("quizzes"."max_attempts" is null or "quizzes"."max_attempts" > 0),
	CONSTRAINT "quizzes_suspended_has_time" CHECK ("quizzes"."status" <> 'SUSPENDED' or "quizzes"."suspended_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" integer NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"author_id" integer,
	"body" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "user_notes_body_length" CHECK (char_length("user_notes"."body") between 3 and 400)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"social_links" json DEFAULT '{}'::json NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" timestamp,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"source" "xp_source" NOT NULL,
	"source_id" integer,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_bookmarks" ADD CONSTRAINT "quiz_bookmarks_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_bookmarks" ADD CONSTRAINT "quiz_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_ratings" ADD CONSTRAINT "quiz_ratings_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_ratings" ADD CONSTRAINT "quiz_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_reports" ADD CONSTRAINT "quiz_reports_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_reports" ADD CONSTRAINT "quiz_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_reports" ADD CONSTRAINT "quiz_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_suspended_by_users_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "creator_applications_queue_idx" ON "creator_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "creator_applications_user_idx" ON "creator_applications" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_applications_one_pending_idx" ON "creator_applications" USING btree ("user_id") WHERE "creator_applications"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "moderation_events_user_created_idx" ON "moderation_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "moderation_events_quiz_created_idx" ON "moderation_events" USING btree ("quiz_id","created_at");--> statement-breakpoint
CREATE INDEX "moderation_events_created_idx" ON "moderation_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "question_options_question_idx" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_quiz_position_idx" ON "questions" USING btree ("quiz_id","position");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_created_idx" ON "quiz_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "quiz_attempts_leaderboard_idx" ON "quiz_attempts" USING btree ("quiz_id","score","time_taken");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempts_one_active_idx" ON "quiz_attempts" USING btree ("user_id","quiz_id") WHERE "quiz_attempts"."status" = 'IN_PROGRESS';--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_reports_quiz_reporter_idx" ON "quiz_reports" USING btree ("quiz_id","reporter_id");--> statement-breakpoint
CREATE INDEX "quiz_reports_queue_idx" ON "quiz_reports" USING btree ("status","quiz_id");--> statement-breakpoint
CREATE INDEX "quizzes_browse_idx" ON "quizzes" USING btree ("status","visibility","created_at");--> statement-breakpoint
CREATE INDEX "quizzes_category_idx" ON "quizzes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "quizzes_user_idx" ON "quizzes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notes_user_created_idx" ON "user_notes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "xp_events_user_created_idx" ON "xp_events" USING btree ("user_id","created_at");