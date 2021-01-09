import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { NotAuthorizedError } from "../errors/notAuth";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    throw new NotAuthorizedError();
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
