import { NextFunction, Request, Response } from "express";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  console.log("HERE");
  const { email } = req.body;
  res.send(email);
};
