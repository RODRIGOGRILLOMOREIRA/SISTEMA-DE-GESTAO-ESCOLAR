import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        tipo: string;
      };
      userId?: string;
      userEmail?: string;
      userTipo?: string;
    }
  }
}

export {};
