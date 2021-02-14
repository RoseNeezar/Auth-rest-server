export interface UserPayload {
  userId: string;
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
