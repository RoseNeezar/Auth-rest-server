import { Router } from "express";
import {
  loginUser,
  currentUser,
  refreshToken,
  registerUser,
  revokeRefreshTokensForUser,
  logout,
} from "../controller/auth.controller";
import { isAuth } from "../middlewares/isAuth";
import { validate } from "../validators";
import { loginRule } from "../validators/auth/login.validate";
import { registerRule } from "../validators/auth/register.validate";

const router = Router();

router.post("/login", loginRule, validate, loginUser);
router.post("/register", registerRule, validate, registerUser);
router.post("/logout", isAuth, logout);
router.post("/refresh_token", refreshToken);
router.post("/revoke_access", isAuth, revokeRefreshTokensForUser);
router.post("/me", isAuth, currentUser);

export { router as authRouter };
