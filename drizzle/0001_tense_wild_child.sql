ALTER TABLE "clientProfiles" RENAME TO "client_profiles";--> statement-breakpoint
ALTER TABLE "client_profiles" DROP CONSTRAINT "clientProfiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "client_profiles" DROP CONSTRAINT "clientProfiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_unique" UNIQUE("user_id");