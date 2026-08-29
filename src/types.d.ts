// Ambient augmentation: authMiddleware attaches the authenticated caller's identity to the
// request. Handlers read `req.auth` (present only after authMiddleware has run).
declare namespace Express {
  interface Request {
    auth?: {
      userId: string;
      tenantId: string;
      role: "user" | "admin";
    };
  }
}
