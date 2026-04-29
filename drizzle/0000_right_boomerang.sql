CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'HIRED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."experience" AS ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('IT', 'HEALTHCARE', 'EDUCATION', 'REAL_ESTATE', 'HOSPITALITY', 'RETAIL', 'E_COMMERCE', 'LEGAL', 'CONSULTING', 'MANUFACTURING', 'TRANSPORTATION', 'LOGISTICS', 'MEDIA', 'ENTERTAINMENT', 'PUBLIC_SECTOR', 'NON_PROFIT', 'ENGINEERING', 'BIOTECH', 'PHARMACEUTICAL', 'AGRICULTURE', 'ENERGY', 'TELECOMMUNICATION', 'SECURITY', 'CYBERSECURITY', 'GAMING', 'SPORTS', 'AUTOMOTIVE', 'AEROSPACE');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('OPEN', 'CLOSED', 'FILLED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('MESSAGE', 'JOB', 'PAYMENT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'FREELANCER', 'CLIENT');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"freelancer_id" uuid,
	"cover_letter" text,
	"resume" text,
	"applied_at" timestamp DEFAULT now(),
	"status" "application_status" DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"chat_id" uuid,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clientProfiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"industry" "industry",
	"company_name" text,
	"company_website" text,
	"linkedin_profile" text,
	CONSTRAINT "clientProfiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "freelancer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"resume" text,
	"industry" "industry",
	"skills" text[],
	"experience" text,
	"education" text,
	"languages" text[],
	"bio" text,
	"rate_per_hour" real,
	"dob" timestamp,
	"city" text,
	"state" text,
	"pincode" integer,
	"contact" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "freelancer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid,
	"title" text,
	"description" text,
	"posted_at" timestamp DEFAULT now(),
	"required_experience" "experience",
	"pay_per_hour" real,
	"mandatory_skills" text[],
	"nice_to_have_skills" text[],
	"tools" text[],
	"preferred_location" text,
	"preferred_education" text,
	"client_location" text,
	"status" "job_status" DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid,
	"sender_id" uuid,
	"content" text,
	"timestamp" timestamp DEFAULT now(),
	"is_seen" boolean DEFAULT false,
	"is_typing" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "notification_type",
	"title" text,
	"description" text,
	"is_new" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"client_id" uuid,
	"freelancer_id" uuid,
	"amount" real,
	"status" "payment_status",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"freelancer_id" uuid,
	"client_id" uuid,
	"rating" integer,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"job_id" uuid,
	"saved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'CLIENT',
	"password" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientProfiles" ADD CONSTRAINT "clientProfiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelancer_profiles" ADD CONSTRAINT "freelancer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_freelancer_unique" ON "applications" USING btree ("job_id","freelancer_id");