-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "userId" TEXT;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
