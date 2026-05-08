import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const ADMIN_USER_IDS = [4];

function requireAdmin(req: any, res: any, next: any) {
  if (!ADMIN_USER_IDS.includes(req.currentUserId)) {
    return res.status(403).json({ error: "Доступ запрещён" });
  }
  next();
}

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const rows = await db.execute(
      sql`SELECT id, username, display_name, avatar_color, avatar_url, status, balance, created_at FROM users ORDER BY id`
    );
    res.json(rows.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/admin/give-currency", requireAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || typeof amount !== "number") {
      return res.status(400).json({ error: "Укажите userId и amount" });
    }
    const target = await db.query.usersTable.findFirst({ where: eq(usersTable.id, Number(userId)) });
    if (!target) return res.status(404).json({ error: "Пользователь не найден" });

    await db.execute(sql`UPDATE users SET balance = balance + ${amount} WHERE id = ${Number(userId)}`);
    const rows = await db.execute(sql`SELECT balance FROM users WHERE id = ${Number(userId)}`);
    const newBalance = Number((rows.rows[0] as any).balance);

    res.json({
      success: true,
      userId: Number(userId),
      username: target.username,
      displayName: target.displayName,
      amount,
      newBalance,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/admin/set-balance", requireAdmin, async (req, res) => {
  try {
    const { userId, balance } = req.body;
    if (!userId || typeof balance !== "number" || balance < 0) {
      return res.status(400).json({ error: "Укажите userId и balance (≥0)" });
    }
    const target = await db.query.usersTable.findFirst({ where: eq(usersTable.id, Number(userId)) });
    if (!target) return res.status(404).json({ error: "Пользователь не найден" });

    await db.execute(sql`UPDATE users SET balance = ${balance} WHERE id = ${Number(userId)}`);
    res.json({ success: true, userId: Number(userId), username: target.username, balance });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const totals = await db.execute(
      sql`SELECT COUNT(*) as total_users, SUM(balance) as total_spark FROM users`
    );
    const row = totals.rows[0] as any;
    res.json({
      totalUsers: Number(row.total_users),
      totalSpark: Number(row.total_spark || 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
