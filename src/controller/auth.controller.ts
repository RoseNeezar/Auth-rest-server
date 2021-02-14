import { compare, hash } from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import { createTokens } from "../utils/createTokens";
import { sendCookieToken } from "../utils/sendCookieToken";

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
  sendCookieToken(res, createTokens(user));

  const { ["password"]: _, ...result } = user;

  return res.status(201).send({
    result,
  });
};

export const currentUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let user;
  try {
    const result = await User.findOne(req.currentUser?.userId);
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
