import { compare, hash } from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import { createTokens } from "../utils/createTokens";
import { sendCookieToken } from "../utils/sendCookieToken";

interface UserPayload {
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

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;
  const hashedPassword = await hash(password, 12);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(401).json({ error: "Email in used" });
  }

  let user;
  try {
    const result = await User.create({
      email,
      password: hashedPassword,
    }).save();
    user = result;

    // sendRefreshToken(res, createRefreshToken(user));
    // sendAccessToken(res, createAccessToken(user));
    sendCookieToken(res, createTokens(user));
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "DB error" });
  }

  const { ["password"]: _, ...result } = user;

  return res.status(201).send({
    result,
  });
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(500).json({ error: "DB error1" });
  }

  const valid = await compare(password, user.password);

  if (!valid) {
    return res.status(500).json({ error: "DB error2" });
  }

  // login successful

  // sendRefreshToken(res, createRefreshToken(user));
  // sendAccessToken(res, createAccessToken(user));
  sendCookieToken(res, createTokens(user));

  const { ["password"]: _, ...result } = user;

  return res.status(201).send({
    result,
  });
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.send({ ok: false, accessToken: "" });
  }

  let payload: any = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: "" });
  }

  const user = await User.findOne({ id: payload.userId });

  if (!user) {
    return res.send({ ok: false, accessToken: "" });
  }
  console.log("payload: ", payload, "user: ", user);
  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: "" });
  }

  // sendRefreshToken(res, createRefreshToken(user));
  // sendAccessToken(res, createAccessToken(user));
  sendCookieToken(res, createTokens(user));

  return res.send({ ok: true });
};

export const currentUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res.status(401).json({ error: "Unauthorised" });
  }
  let user;
  try {
    const token = authorization.split(" ")[1];
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const result = await User.findOne(payload.userId);
    user = result;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "DB error" });
  }

  const { ["password"]: _, ...result } = user as User;

  return res.status(201).send({
    result,
  });
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // sendRefreshToken(res, "");
  sendCookieToken(res, { accessToken: "", refreshToken: "" });

  return res.status(201).send(true);
};

export const revokeRefreshTokensForUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  await getConnection()
    .getRepository(User)
    .increment({ id: req.currentUser!.userId }, "tokenVersion", 1);

  return res.status(201).send(true);
};
