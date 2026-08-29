// Ambient augmentation: authMiddleware attaches the caller's tenant and role to the request.
declare namespace Express {
  interface Request {
    tenantId?: string;
    role?: "user" | "admin";
  }
}
