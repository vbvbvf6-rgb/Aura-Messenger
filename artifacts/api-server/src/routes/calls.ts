import { Router } from "express";
import { db, callsTable, usersTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { InitiateCallBody, UpdateCallStatusBody } from "@workspace/api-zod";

const router = Router();

async function buildCall(call: typeof callsTable.$inferSelect) {
  const caller = call.callerId ? await db.query.usersTable.findFirst({ where: eq(usersTable.id, call.callerId) }) : null;
  const callee = call.calleeId ? await db.query.usersTable.findFirst({ where: eq(usersTable.id, call.calleeId) }) : null;
  return { ...call, caller, callee };
}

router.get("/calls", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const calls = await db.select().from(callsTable)
      .where(or(eq(callsTable.callerId, uid), eq(callsTable.calleeId, uid)))
      .orderBy(desc(callsTable.createdAt))
      .limit(50);
    const built = await Promise.all(calls.map(buildCall));
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/calls", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const body = InitiateCallBody.parse(req.body);
    const [call] = await db.insert(callsTable).values({
      callerId: uid,
      calleeId: body.calleeId,
      chatId: body.chatId,
      type: body.type,
      status: "ringing",
    }).returning();
    const built = await buildCall(call);
    res.status(201).json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/calls/:callId", async (req, res) => {
  try {
    const callId = Number(req.params.callId);
    const call = await db.query.callsTable.findFirst({ where: eq(callsTable.id, callId) });
    if (!call) return res.status(404).json({ error: "Call not found" });
    const built = await buildCall(call);
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/calls/:callId", async (req, res) => {
  try {
    const callId = Number(req.params.callId);
    const body = UpdateCallStatusBody.parse(req.body);
    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === "active") updateData.startedAt = new Date();
    if (body.status === "ended" || body.status === "declined") {
      updateData.endedAt = new Date();
      const call = await db.query.callsTable.findFirst({ where: eq(callsTable.id, callId) });
      if (call?.startedAt) {
        const dur = Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000);
        updateData.durationSeconds = dur;
      }
    }
    const [updated] = await db.update(callsTable).set(updateData).where(eq(callsTable.id, callId)).returning();
    const built = await buildCall(updated);
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
