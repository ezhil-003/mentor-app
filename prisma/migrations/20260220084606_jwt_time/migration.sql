-- AlterTable
ALTER TABLE "jwks" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
