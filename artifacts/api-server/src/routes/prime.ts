import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const PRIME_PLANS: Record<string, { spark: number; months: number }> = {
  monthly:  { spark: 499,  months: 1  },
  halfyear: { spark: 1974, months: 6  },
  yearly:   { spark: 2988, months: 12 },
};

const PLUS_PLANS: Record<string, { spark: number; months: number }> = {
  monthly:  { spark: 899,  months: 1  },
  halfyear: { spark: 3594, months: 6  },
  yearly:   { spark: 5388, months: 12 },
};

router.post("/prime/subscribe", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const { planId, tier } = req.body;
    const isPlus = tier === "prime_plus";
    const plans = isPlus ? PLUS_PLANS : PRIME_PLANS;
    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ error: "Неверный план подписки" });
    }

    const rows = await db.execute(sql`SELECT balance, has_prime, prime_tier, prime_expires_at FROM users WHERE id = ${uid}`);
    const user = rows.rows[0] as any;
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const balance = Number(user.balance ?? 0);
    if (balance < plan.spark) {
      return res.status(400).json({
        error: `Недостаточно Spark. Нужно ${plan.spark} ⚡, у вас ${balance} ⚡`,
        required: plan.spark,
        balance,
      });
    }

    const now = new Date();
    const currentExpiry = user.prime_expires_at ? new Date(user.prime_expires_at) : now;
    const base = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + plan.months);

    const tierValue = isPlus ? "prime_plus" : "prime";

    await db.execute(
      sql`UPDATE users
          SET balance = balance - ${plan.spark},
              has_prime = true,
              prime_tier = ${tierValue},
              prime_expires_at = ${newExpiry.toISOString()}
          WHERE id = ${uid}`
    );

    const currentTier = user.prime_tier;
    const hadPrime = user.has_prime === true || user.has_prime === "t" || user.has_prime === 1;
    const isUpgrade = hadPrime && currentTier !== tierValue;
    const isFirstTime = !hadPrime;
    const SIGNUP_BONUS = isFirstTime || isUpgrade ? (isPlus ? 100 : 50) : 0;
    if (SIGNUP_BONUS > 0) {
      await db.execute(sql`UPDATE users SET balance = balance + ${SIGNUP_BONUS} WHERE id = ${uid}`);
    }

    const updated = await db.execute(sql`SELECT balance FROM users WHERE id = ${uid}`);
    const newBalance = Number((updated.rows[0] as any)?.balance ?? 0);

    res.json({
      success: true,
      balance: newBalance,
      primeExpiresAt: newExpiry.toISOString(),
      primeTier: tierValue,
      bonusAwarded: SIGNUP_BONUS,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/prime/status", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const rows = await db.execute(sql`SELECT has_prime, prime_tier, prime_expires_at FROM users WHERE id = ${uid}`);
    const user = rows.rows[0] as any;
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const hasPrime = user.has_prime === true || user.has_prime === "t";
    const expiresAt = user.prime_expires_at ?? null;
    const isActive = hasPrime && expiresAt && new Date(expiresAt) > new Date();

    if (hasPrime && expiresAt && !isActive) {
      await db.execute(sql`UPDATE users SET has_prime = false, prime_tier = null WHERE id = ${uid}`);
    }

    res.json({ hasPrime: isActive, primeTier: user.prime_tier ?? null, primeExpiresAt: expiresAt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/prime/gift", async (req, res) => {
  try {
    const senderId = req.currentUserId;
    const { planId, recipientId, tier } = req.body;
    const isPlus = tier === "prime_plus";
    const plans = isPlus ? PLUS_PLANS : PRIME_PLANS;
    const plan = plans[planId];
    if (!plan) return res.status(400).json({ error: "Неверный план подписки" });
    if (!recipientId || typeof recipientId !== "number") return res.status(400).json({ error: "Укажите получателя" });
    if (recipientId === senderId) return res.status(400).json({ error: "Нельзя подарить подписку самому себе" });

    const PLAN_STARS: Record<string, number> = { monthly: 1000, halfyear: 1500, yearly: 2500 };
    const cost = PLAN_STARS[planId] ?? plan.spark;

    const senderRows = await db.execute(sql`SELECT balance FROM users WHERE id = ${senderId}`);
    const sender = senderRows.rows[0] as any;
    if (!sender) return res.status(404).json({ error: "Пользователь не найден" });

    const senderBalance = Number(sender.balance ?? 0);
    if (senderBalance < cost) {
      return res.status(400).json({ error: `Недостаточно Монет. Нужно ${cost}, у вас ${senderBalance}`, balance: senderBalance });
    }

    const recipientRows = await db.execute(sql`SELECT id, has_prime, prime_expires_at FROM users WHERE id = ${recipientId}`);
    const recipient = recipientRows.rows[0] as any;
    if (!recipient) return res.status(404).json({ error: "Получатель не найден" });

    const now = new Date();
    const currentExpiry = recipient.prime_expires_at ? new Date(recipient.prime_expires_at) : now;
    const base = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + plan.months);

    const tierValue = isPlus ? "prime_plus" : "prime";

    await db.execute(sql`UPDATE users SET balance = balance - ${cost} WHERE id = ${senderId}`);
    await db.execute(sql`UPDATE users SET has_prime = true, prime_tier = ${tierValue}, prime_expires_at = ${newExpiry.toISOString()} WHERE id = ${recipientId}`);

    const updated = await db.execute(sql`SELECT balance FROM users WHERE id = ${senderId}`);
    const newBalance = Number((updated.rows[0] as any)?.balance ?? 0);

    res.json({ success: true, balance: newBalance, primeExpiresAt: newExpiry.toISOString(), primeTier: tierValue });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
