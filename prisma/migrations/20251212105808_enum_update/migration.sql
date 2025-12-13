/*
  Warnings:

  - The values [beginner,intermediate,expert] on the enum `Experience` will be removed. If these variants are still used in the database, this will fail.
  - The values [it,design,marketing,writing,finance,engineering,other] on the enum `Industry` will be removed. If these variants are still used in the database, this will fail.
  - The values [open,closed] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [message,job,payment,system] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,completed,failed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [user,freelancer,client,admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `languages` column on the `FreelancerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Experience_new" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');
ALTER TABLE "Job" ALTER COLUMN "requiredExperience" TYPE "Experience_new" USING ("requiredExperience"::text::"Experience_new");
ALTER TYPE "Experience" RENAME TO "Experience_old";
ALTER TYPE "Experience_new" RENAME TO "Experience";
DROP TYPE "public"."Experience_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Industry_new" AS ENUM ('IT', 'HEALTHCARE', 'EDUCATION', 'REAL_ESTATE', 'HOSPITALITY', 'RETAIL', 'E_COMMERCE', 'LEGAL', 'CONSULTING', 'MANUFACTURING', 'TRANSPORTATION', 'LOGISTICS', 'MEDIA', 'ENTERTAINMENT', 'PUBLIC_SECTOR', 'NON_PROFIT', 'ENGINEERING', 'BIOTECH', 'PHARMACEUTICAL', 'AGRICULTURE', 'ENERGY', 'TELECOMMUNICATION', 'SECURITY', 'CYBERSECURITY', 'GAMING', 'SPORTS', 'AUTOMOTIVE', 'AEROSPACE');
ALTER TABLE "ClientProfile" ALTER COLUMN "industry" TYPE "Industry_new" USING ("industry"::text::"Industry_new");
ALTER TABLE "FreelancerProfile" ALTER COLUMN "industry" TYPE "Industry_new" USING ("industry"::text::"Industry_new");
ALTER TYPE "Industry" RENAME TO "Industry_old";
ALTER TYPE "Industry_new" RENAME TO "Industry";
DROP TYPE "public"."Industry_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('OPEN', 'CLOSED');
ALTER TABLE "public"."Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('MESSAGE', 'JOB', 'PAYMENT', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'FREELANCER', 'CLIENT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
COMMIT;

-- AlterTable
ALTER TABLE "FreelancerProfile" DROP COLUMN "languages",
ADD COLUMN     "languages" TEXT[];

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';

-- DropEnum
DROP TYPE "Languages";
