import { Router } from "express";
import { db, messagesTable, reactionsTable, usersTable } from "@workspace/db";
import { eq, and, lt, desc } from "drizzle-orm";
import { SendMessageBody, EditMessageBody, AddReactionBody } from "@workspace/api-zod";

const router = Router();

async function buildMessage(msg: typeof messagesTable.$inferSelect) {
  const sender = await db.query.usersTable.findFirst({ where: eq(usersTable.id, msg.senderId) });
  const reactions = await db.select({
    reaction: reactionsTable,
    user: usersTable,
  }).from(reactionsTable)
    .leftJoin(usersTable, eq(reactionsTable.userId, usersTable.id))
    .where(eq(reactionsTable.messageId, msg.id));

  let replyTo = null;
  if (msg.replyToId) {
    const reply = await db.query.messagesTable.findFirst({ where: eq(messagesTable.id, msg.replyToId) });
    if (reply) {
      const replySender = await db.query.usersTable.findFirst({ where: eq(usersTable.id, reply.senderId) });
      replyTo = { ...reply, sender: replySender, reactions: [], replyTo: null, giftData: null };
    }
  }

  return {
    ...msg,
    sender,
    reactions: reactions.map(r => ({ ...r.reaction, user: r.user })),
    replyTo,
    giftData: null,
  };
}

router.get("/messages", async (req, res) => {
  try {
    const chatId = Number(req.query.chatId);
    const limit = Number(req.query.limit ?? 50);
    const before = req.query.before ? Number(req.query.before) : undefined;

    let query = db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId));
    if (before) {
      query = db.select().from(messagesTable).where(
        and(eq(messagesTable.chatId, chatId), lt(messagesTable.id, before))
      );
    }

    const msgs = await query.orderBy(desc(messagesTable.createdAt)).limit(limit);
    const built = await Promise.all(msgs.reverse().map(buildMessage));
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const body = SendMessageBody.parse(req.body);
    const [msg] = await db.insert(messagesTable).values({
      chatId: body.chatId,
      senderId: uid,
      text: body.text,
      type: body.type ?? "text",
      mediaUrl: body.mediaUrl,
      replyToId: body.replyToId,
    }).returning();
    const built = await buildMessage(msg);
    res.status(201).json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/messages/:messageId", async (req, res) => {
  try {
    const messageId = Number(req.params.messageId);
    const body = EditMessageBody.parse(req.body);
    const [msg] = await db.update(messagesTable)
      .set({ text: body.text, isEdited: true })
      .where(eq(messagesTable.id, messageId))
      .returning();
    const built = await buildMessage(msg);
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/messages/:messageId", async (req, res) => {
  try {
    const messageId = Number(req.params.messageId);
    await db.delete(reactionsTable).where(eq(reactionsTable.messageId, messageId));
    await db.delete(messagesTable).where(eq(messagesTable.id, messageId));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages/:messageId/reactions", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const messageId = Number(req.params.messageId);
    const body = AddReactionBody.parse(req.body);
    const [reaction] = await db.insert(reactionsTable).values({
      messageId,
      userId: uid,
      emoji: body.emoji,
    }).returning();
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, uid) });
    res.status(201).json({ ...reaction, user });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/messages/:messageId/reactions", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const messageId = Number(req.params.messageId);
    const body = AddReactionBody.parse(req.body);
    await db.delete(reactionsTable).where(
      and(
        eq(reactionsTable.messageId, messageId),
        eq(reactionsTable.userId, uid),
        eq(reactionsTable.emoji, body.emoji)
      )
    );
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
