import { Router } from "express";
import { db, giftsTable, giftItemsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { SendGiftBody } from "@workspace/api-zod";

const router = Router();

async function buildGift(gift: typeof giftsTable.$inferSelect) {
  const giftItem = await db.query.giftItemsTable.findFirst({ where: eq(giftItemsTable.id, gift.giftItemId) });
  const sender = gift.isAnonymous ? null : await db.query.usersTable.findFirst({ where: eq(usersTable.id, gift.senderId) });
  const receiver = await db.query.usersTable.findFirst({ where: eq(usersTable.id, gift.receiverId) });
  return { ...gift, giftItem, sender, receiver };
}

router.get("/gifts", async (req, res) => {
  try {
    const items = await db.select().from(giftItemsTable);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gifts/sent", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const gifts = await db.select().from(giftsTable)
      .where(eq(giftsTable.senderId, uid))
      .orderBy(desc(giftsTable.createdAt));
    const built = await Promise.all(gifts.map(buildGift));
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gifts/received", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const gifts = await db.select().from(giftsTable)
      .where(eq(giftsTable.receiverId, uid))
      .orderBy(desc(giftsTable.createdAt));
    const built = await Promise.all(gifts.map(buildGift));
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/gifts/send", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const body = SendGiftBody.parse(req.body);

    const giftItem = await db.query.giftItemsTable.findFirst({
      where: eq(giftItemsTable.id, body.giftItemId),
    });
    if (!giftItem) {
      return res.status(404).json({ error: "Подарок не найден" });
    }

    const price = (giftItem as any).price ?? 0;

    if (price > 0) {
      const balanceRows = await db.execute(
        sql`SELECT balance FROM users WHERE id = ${uid}`
      );
      const balance = Number((balanceRows.rows[0] as any)?.balance ?? 0);
      if (balance < price) {
        return res.status(400).json({
          error: `Недостаточно Spark. Нужно ${price} ⚡, у вас ${balance} ⚡`,
          required: price,
          balance,
        });
      }
      await db.execute(
        sql`UPDATE users SET balance = balance - ${price} WHERE id = ${uid}`
      );
    }

    const [gift] = await db.insert(giftsTable).values({
      giftItemId: body.giftItemId,
      senderId: uid,
      receiverId: body.receiverId,
      message: body.message,
      isAnonymous: body.isAnonymous ?? false,
      chatId: body.chatId,
    }).returning();

    const built = await buildGift(gift);
    res.status(201).json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
