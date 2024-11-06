-- CreateTable
CREATE TABLE "Gutschein" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employee" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oldSystem" BOOLEAN NOT NULL,
    "value" INTEGER NOT NULL,
    "usedValue" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,

    CONSTRAINT "Gutschein_pkey" PRIMARY KEY ("id")
);
