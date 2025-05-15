/*
  Warnings:

  - You are about to drop the `Parts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Parts";

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER,
    "productCode" TEXT NOT NULL,
    "productModel" TEXT,
    "productDescription" TEXT,
    "parentCatalogName" TEXT,
    "catalogName" TEXT,
    "brandName" TEXT,
    "encapStandard" TEXT,
    "productImages" TEXT[],
    "pdfLink" TEXT,
    "productLink" TEXT,
    "prices" JSONB,
    "voltage" DOUBLE PRECISION,
    "capacitance" DOUBLE PRECISION,
    "current" DOUBLE PRECISION,
    "power" DOUBLE PRECISION,
    "resistance" DOUBLE PRECISION,
    "frequency" DOUBLE PRECISION,
    "inductance" DOUBLE PRECISION,
    "tolerance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Part_productCode_key" ON "Part"("productCode");
