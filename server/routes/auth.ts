import { Router } from "express";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const authRouter = Router();

// Simple password hashing for demo (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, name, email, role, organization } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: "Missing required fields: username, password, name, email" });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const emailCheck = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (emailCheck.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const newUser = await db.insert(users).values({
      username,
      password: hashPassword(password),
      name,
      email,
      role: role || "student",
      organization: organization || "MoSPI",
    }).returning();

    const user = newUser[0];
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.role = user.role;

    res.json({
      success: true,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, organization: user.organization },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!userResult.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult[0];
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last active
    await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id));

    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.role = user.role;

    res.json({
      success: true,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, organization: user.organization },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", (req, res) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

// GET /api/auth/me — Get current user
authRouter.get("/me", async (req, res) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userResult.length) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult[0];
    res.json({
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, organization: user.organization },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get user" });
  }
});
