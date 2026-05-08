import { Router } from "express";
import { db, postsTable, postLikesTable, postCommentsTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

async function buildPost(postId: number, currentUserId: number) {
  const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, postId) });
  if (!post) return null;
  const author = await db.query.usersTable.findFirst({ where: eq(usersTable.id, post.userId) });
  const likeRow = await db.query.postLikesTable.findFirst({
    where: and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, currentUserId))
  });
  return { ...post, author: author ?? null, isLiked: !!likeRow };
}

router.get("/posts", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(50);
    const built = await Promise.all(posts.map(p => buildPost(p.id, uid)));
    res.json(built.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const { text, imageUrl } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const [post] = await db.insert(postsTable).values({ userId: uid, text, imageUrl }).returning();
    const built = await buildPost(post.id, uid);
    res.status(201).json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/posts/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    await db.delete(postCommentsTable).where(eq(postCommentsTable.postId, postId));
    await db.delete(postLikesTable).where(eq(postLikesTable.postId, postId));
    await db.delete(postsTable).where(eq(postsTable.id, postId));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts/:postId/like", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const postId = Number(req.params.postId);
    const existing = await db.query.postLikesTable.findFirst({
      where: and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, uid))
    });
    if (existing) {
      await db.delete(postLikesTable).where(eq(postLikesTable.id, existing.id));
      await db.update(postsTable).set({ likesCount: Math.max(0, (await db.query.postsTable.findFirst({ where: eq(postsTable.id, postId) }))!.likesCount - 1) }).where(eq(postsTable.id, postId));
    } else {
      await db.insert(postLikesTable).values({ postId, userId: uid });
      const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, postId) });
      await db.update(postsTable).set({ likesCount: (post?.likesCount ?? 0) + 1 }).where(eq(postsTable.id, postId));
    }
    const built = await buildPost(postId, uid);
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await db.select().from(postCommentsTable).where(eq(postCommentsTable.postId, postId)).orderBy(postCommentsTable.createdAt);
    const built = await Promise.all(comments.map(async c => {
      const author = await db.query.usersTable.findFirst({ where: eq(usersTable.id, c.userId) });
      return { ...c, author: author ?? null };
    }));
    res.json(built);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const uid = req.currentUserId;
    const postId = Number(req.params.postId);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const [comment] = await db.insert(postCommentsTable).values({ postId, userId: uid, text }).returning();
    const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, postId) });
    await db.update(postsTable).set({ commentsCount: (post?.commentsCount ?? 0) + 1 }).where(eq(postsTable.id, postId));
    const author = await db.query.usersTable.findFirst({ where: eq(usersTable.id, uid) });
    res.status(201).json({ ...comment, author: author ?? null });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
