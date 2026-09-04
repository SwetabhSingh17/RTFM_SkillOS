import { Request, Response, NextFunction } from "express";

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * Ensures that the authenticated user has one of the allowed roles.
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In this prototype, authentication is mocked/simplified.
    // We expect the frontend to send the user's role in a custom header (X-User-Role)
    // or we would extract it from a JWT token in req.headers.authorization.
    
    // For the hackathon MVP, we check the X-User-Role header for simplicity,
    // or fallback to assuming the user is not authorized if not provided.
    const userRole = req.headers["x-user-role"] as string;

    if (!userRole) {
      return res.status(401).json({ error: "Unauthorized: Missing role context" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Forbidden: You do not have permission to access this resource",
        required: allowedRoles,
        provided: userRole
      });
    }

    next();
  };
};

/**
 * Pre-defined role groups for standard MoSPI platform access
 */
export const ROLES = {
  // Administrador del sistema: gestión de usuarios, analíticas globales, quizzes globales
  ADMIN: "admin", 
  // HR / Department Head: analíticas departamentales, asignar rutas de aprendizaje, crear quizzes
  HR: "hr", 
  // Trainer: genera quizzes a partir de materiales, ve el progreso de los learners
  TRAINER: "trainer", 
  // Learner: sólo su dashboard, tomar quizzes, consumir rutas de aprendizaje
  LEARNER: "learner"
};
