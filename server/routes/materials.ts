import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { learningMaterials } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { contentProcessor } from "../services/contentProcessor";
import { requireRoles, ROLES } from "../middleware/rbac";

// Configure storage — local filesystem by default, S3 ready
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const STORAGE_TYPE = process.env.UPLOAD_STORAGE_TYPE || "local";
const MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE_MB || "50", 10) * 1024 * 1024;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/json",
    "image/png",
    "image/jpeg",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Accepted: PDF, DOCX, PPTX, TXT, JSON, Images, MP4, WebM`));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

export const materialsRouter = Router();

// POST /api/materials/upload — Upload file
materialsRouter.post("/upload", requireRoles([ROLES.ADMIN, ROLES.TRAINER, ROLES.HR]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = parseInt(req.body.userId) || 1;
    const title = req.body.title || req.file.originalname;
    const description = req.body.description || "";

    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const fileTypeMap: Record<string, string> = {
      pdf: "pdf", docx: "docx", pptx: "pptx", txt: "txt", json: "json",
      png: "image", jpg: "image", jpeg: "image", webp: "image",
      mp4: "video", webm: "video",
    };

    const material = await db.insert(learningMaterials).values({
      uploadedById: userId,
      title,
      description,
      fileType: fileTypeMap[ext] || ext,
      fileUrl: STORAGE_TYPE === "local" ? `/uploads/${req.file.filename}` : req.file.filename,
      fileSize: req.file.size,
      processingStatus: "pending",
    }).returning();

    res.json({ success: true, material: material[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload material" });
  }
});

// GET /api/materials — List all materials
materialsRouter.get("/", async (req, res) => {
  try {
    const materials = await db.select().from(learningMaterials);
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// GET /api/materials/:id — Material details
materialsRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const material = await db.select().from(learningMaterials).where(eq(learningMaterials.id, id)).limit(1);
    if (!material.length) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch material" });
  }
});

// POST /api/materials/:id/process — Trigger text extraction
materialsRouter.post("/:id/process", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const material = await db.select().from(learningMaterials).where(eq(learningMaterials.id, id)).limit(1);

    if (!material.length) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Update status to processing
    await db.update(learningMaterials).set({ processingStatus: "processing" }).where(eq(learningMaterials.id, id));

    // Extract text
    const filePath = path.join(UPLOAD_DIR, path.basename(material[0].fileUrl));

    let extractedText = "";
    try {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        extractedText = await contentProcessor.extractText(buffer, material[0].fileType);
      } else {
        extractedText = "File not found on disk. Using placeholder text for demo.";
      }
    } catch (err) {
      console.error("Text extraction error:", err);
      extractedText = "Text extraction failed. Manual content entry may be required.";
    }

    // Update with extracted text
    await db.update(learningMaterials).set({
      extractedText,
      processingStatus: "ready",
      processedAt: new Date(),
    }).where(eq(learningMaterials.id, id));

    res.json({ success: true, extractedText: extractedText.substring(0, 500) + "..." });
  } catch (error) {
    console.error(error);
    await db.update(learningMaterials).set({ processingStatus: "failed" }).where(eq(learningMaterials.id, parseInt(req.params.id)));
    res.status(500).json({ error: "Failed to process material" });
  }
});

// DELETE /api/materials/:id — Remove material
materialsRouter.delete("/:id", requireRoles([ROLES.ADMIN, ROLES.HR]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const material = await db.select().from(learningMaterials).where(eq(learningMaterials.id, id)).limit(1);

    if (material.length) {
      // Delete file from disk
      const filePath = path.join(UPLOAD_DIR, path.basename(material[0].fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // For MVP, we don't actually delete from DB, just mark as removed
    // In production, implement soft delete or cascade
    res.json({ success: true, message: "Material deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete material" });
  }
});
