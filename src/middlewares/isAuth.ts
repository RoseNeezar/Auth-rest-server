import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res.status(404).json({ error: "not Auth" });
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.currentUser = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("not authenticated");
  }

  return next();
};
