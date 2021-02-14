import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { createTokens } from "../utils/createTokens";
import { User } from "../entities/User";
import { UserPayload } from "../types/global";
import { sendCookieToken } from "../utils/sendCookieToken";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  console.log("1", req.cookies, accessToken);
  if (typeof accessToken !== "string") {
    return res.status(401).json({ error: "not authenticated" });
  }

  try {
    const data = <UserPayload>(
      verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    );
    req.currentUser = data;
    return next();
  } catch {}

  const refreshToken = req.cookies.refreshToken;
  if (typeof refreshToken !== "string") {
    return res.status(401).json({ error: "not authenticated" });
  }

  let data;
  try {
    data = <UserPayload>verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ error: "not authenticated" });
  }

  const user = await User.findOne(data.userId);
  // token has been invalidated or user deleted
  if (!user || user.tokenVersion !== data.tokenVersion) {
    return res.status(401).json({ error: "not authenticated" });
  }

  sendCookieToken(res, createTokens(user));

  req.currentUser = data;

  next();
};
