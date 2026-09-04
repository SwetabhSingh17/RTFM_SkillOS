import { Router } from "express";
import { db } from "../db";
import { users, userProfiles, UserRole } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireRoles } from "../middleware/rbac";

export const usersRouter = Router();

// Manual Registration
usersRouter.post("/register", async (req, res) => {
  try {
    const {
      username, password, name, email, organization, role,
      designation, department, jobRole, currentAssignment,
      educationalQualifications, workExperienceYears, previousTrainings
    } = req.body;

    if (!username || !password || !name || !email || !designation || !department || !jobRole) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const emailExisting = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (emailExisting.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // For simplicity, we are not hashing passwords in this prototype (as per current auth.ts)
    // In production, ALWAYS hash passwords.
    const [newUser] = await db.insert(users).values({
      username,
      password, // In real app: bcrypt.hashSync(password, 10)
      name,
      email,
      organization: organization || "MoSPI",
      role: role || UserRole.LEARNER,
      onboardingCompleted: true, // Manual registration implies onboarding is complete
    }).returning();

    // Insert Cold Start Parameters
    await db.insert(userProfiles).values({
      userId: newUser.id,
      designation,
      department,
      jobRole,
      currentAssignment,
      educationalQualifications,
      workExperienceYears: parseInt(workExperienceYears) || 0,
      previousTrainings: previousTrainings ? (Array.isArray(previousTrainings) ? previousTrainings : previousTrainings.split(",")) : [],
    });

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register" });
  }
});

// Bulk Upload (Admin/HR Only)
usersRouter.post("/bulk-upload", requireRoles([UserRole.ADMIN, UserRole.HR]), async (req, res) => {
  try {
    const { users: bulkUsers } = req.body;
    
    if (!bulkUsers || !Array.isArray(bulkUsers)) {
      return res.status(400).json({ error: "Invalid payload. Expected an array of users." });
    }

    const createdUsers = [];
    const errors = [];

    for (const u of bulkUsers) {
      try {
        if (!u.username || !u.name || !u.email || !u.designation || !u.department || !u.jobRole) {
          errors.push({ user: u.email, error: "Missing required fields" });
          continue;
        }

        // Generate default password if not provided
        const defaultPassword = u.password || "Welcome@123";

        // Check exists
        const [existing] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
        if (existing) {
          errors.push({ user: u.email, error: "Email already exists" });
          continue;
        }

        const [newUser] = await db.insert(users).values({
          username: u.username,
          password: defaultPassword,
          name: u.name,
          email: u.email,
          organization: u.organization || "MoSPI",
          role: u.role || UserRole.LEARNER,
          onboardingCompleted: false, // Forces user to review their profile on first login
        }).returning();

        await db.insert(userProfiles).values({
          userId: newUser.id,
          designation: u.designation,
          department: u.department,
          jobRole: u.jobRole,
          currentAssignment: u.currentAssignment,
          educationalQualifications: u.educationalQualifications,
          workExperienceYears: parseInt(u.workExperienceYears) || 0,
          previousTrainings: u.previousTrainings ? (Array.isArray(u.previousTrainings) ? u.previousTrainings : u.previousTrainings.split(",")) : [],
        });

        createdUsers.push(newUser);
      } catch (err: any) {
        errors.push({ user: u.email, error: err.message });
      }
    }

    res.status(200).json({
      message: "Bulk upload complete",
      successCount: createdUsers.length,
      errorCount: errors.length,
      errors
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message || "Failed to process bulk upload" });
  }
});

// Get all users (Admin/HR Only)
usersRouter.get("/", requireRoles([UserRole.ADMIN, UserRole.HR]), async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      organization: users.organization,
      onboardingCompleted: users.onboardingCompleted,
      createdAt: users.createdAt,
    }).from(users);

    res.json({ users: allUsers });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
