import { Router } from "express";
import { db, contactsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddContactBody } from "@workspace/api-zod";

const router = Router();

router.get("/contacts", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const contacts = await db
      .select({ user: usersTable })
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.contactId, usersTable.id))
      .where(eq(contactsTable.userId, uid));
    res.json(contacts.map(c => c.user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const body = AddContactBody.parse(req.body);
    await db.insert(contactsTable).values({ userId: uid, contactId: body.userId }).onConflictDoNothing();
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, body.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(201).json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contacts/:contactId", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const contactId = Number(req.params.contactId);
    await db.delete(contactsTable).where(
      and(eq(contactsTable.userId, uid), eq(contactsTable.contactId, contactId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
