import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";

const router = Router();

router.get("/users/me", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, uid) });
    if (!user) return res.status(404).json({ error: "User not found" });
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const balance = rows.rows[0] ? Number((rows.rows[0] as any).balance) : 0;
    res.json({ ...user, balance });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/me", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const body = UpdateMeBody.parse(req.body);
    const [updated] = await db.update(usersTable).set(body).where(eq(usersTable.id, uid)).returning();
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const balance = rows.rows[0] ? Number((rows.rows[0] as any).balance) : 0;
    res.json({ ...updated, balance });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/search", async (req, res) => {
  try {
    const q = String(req.query.q || "");
    const users = await db.select().from(usersTable).where(
      or(
        like(usersTable.username, `%${q}%`),
        like(usersTable.displayName, `%${q}%`)
      )
    ).limit(20);
    res.json(users);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallet", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const balance = rows.rows[0] ? Number((rows.rows[0] as any).balance) : 0;
    const address = `PLS${String(1000000000 + uid)}SPARK`;
    res.json({ balance, address, currency: "SPARK", symbol: "⚡" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallet/earn", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    await db.execute(sql`UPDATE users SET balance = balance + ${amount} WHERE id = ${uid}`);
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const balance = Number((rows.rows[0] as any).balance);
    res.json({ balance });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallet/spend", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const balance = Number((rows.rows[0] as any).balance);
    if (balance < amount) {
      return res.status(400).json({ error: "Недостаточно средств", balance });
    }
    await db.execute(sql`UPDATE users SET balance = balance - ${amount} WHERE id = ${uid}`);
    const result = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const newBalance = Number((result.rows[0] as any).balance);
    res.json({ balance: newBalance });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/me", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const { messagesTable, callsTable, giftsTable, chatMembersTable, contactsTable } = await import("@workspace/db");
    const { count, sum } = await import("drizzle-orm");

    const [msgCount] = await db.select({ count: count() }).from(messagesTable).where(eq(messagesTable.senderId, uid));
    const [callCount] = await db.select({ count: count() }).from(callsTable).where(eq(callsTable.callerId, uid));
    const [callDuration] = await db.select({ total: sum(callsTable.durationSeconds) }).from(callsTable).where(eq(callsTable.callerId, uid));
    const [giftsSent] = await db.select({ count: count() }).from(giftsTable).where(eq(giftsTable.senderId, uid));
    const [giftsReceived] = await db.select({ count: count() }).from(giftsTable).where(eq(giftsTable.receiverId, uid));
    const [chatsCount] = await db.select({ count: count() }).from(chatMembersTable).where(eq(chatMembersTable.userId, uid));
    const [contactsCount] = await db.select({ count: count() }).from(contactsTable).where(eq(contactsTable.userId, uid));

    res.json({
      messagesSent: Number(msgCount?.count ?? 0),
      callsMade: Number(callCount?.count ?? 0),
      callDurationSeconds: Number(callDuration?.total ?? 0),
      giftsSent: Number(giftsSent?.count ?? 0),
      giftsReceived: Number(giftsReceived?.count ?? 0),
      chatsCount: Number(chatsCount?.count ?? 0),
      contactsCount: Number(contactsCount?.count ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
