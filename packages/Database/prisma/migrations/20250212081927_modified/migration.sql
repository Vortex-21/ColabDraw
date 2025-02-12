/*
  Warnings:

  - The values [circle] on the enum `shapes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "shapes_new" AS ENUM ('rectangle', 'ellipse');
ALTER TABLE "Geometry" ALTER COLUMN "shape" TYPE "shapes_new" USING ("shape"::text::"shapes_new");
ALTER TYPE "shapes" RENAME TO "shapes_old";
ALTER TYPE "shapes_new" RENAME TO "shapes";
DROP TYPE "shapes_old";
COMMIT;
