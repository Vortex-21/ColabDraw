/*
  Warnings:

  - You are about to drop the column `Shape` on the `Geometry` table. All the data in the column will be lost.
  - Added the required column `shape` to the `Geometry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Geometry" DROP COLUMN "Shape",
ADD COLUMN     "shape" "shapes" NOT NULL;
