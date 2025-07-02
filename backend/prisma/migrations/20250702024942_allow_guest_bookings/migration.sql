-- Создаем новую таблицу bookings с правильными типами для PostgreSQL
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
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Копируем данные из старой таблицы bookings в новую
INSERT INTO "new_bookings" (
    "barberId", "barberShopId", "createdAt", "id", "notes", "phone", "slotId", "status", "totalDuration", "totalPrice", "updatedAt", "userId"
)
SELECT
    "barberId", "barberShopId", "createdAt", "id", "notes", "phone", "slotId", "status", "totalDuration", "totalPrice", "updatedAt", "userId"
FROM "bookings";

-- Удаляем старую таблицу
DROP TABLE "bookings";

-- Переименовываем новую таблицу
ALTER TABLE "new_bookings" RENAME TO "bookings";

-- Создаем уникальный индекс
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings"("slotId");
