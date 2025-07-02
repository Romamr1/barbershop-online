-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "barberId" TEXT NOT NULL,
    "barberShopId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "totalPrice" REAL NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bookings" ("barberId", "barberShopId", "createdAt", "id", "notes", "phone", "slotId", "status", "totalDuration", "totalPrice", "updatedAt", "userId") SELECT "barberId", "barberShopId", "createdAt", "id", "notes", "phone", "slotId", "status", "totalDuration", "totalPrice", "updatedAt", "userId" FROM "bookings";
DROP TABLE "bookings";
ALTER TABLE "new_bookings" RENAME TO "bookings";
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings"("slotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
