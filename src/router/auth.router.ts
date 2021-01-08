import { Router } from "express";
import { loginUser } from "../controller/auth.controller";
import { validate } from "../validators";
import { loginRule } from "../validators/auth/login.validate";

const authRouter = Router();

authRouter.post("/login", loginRule, validate, loginUser);

export default authRouter;
