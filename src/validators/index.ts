import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "./error/error.types";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(new RequestValidationError(errors.array()));
  }

  next();
};
