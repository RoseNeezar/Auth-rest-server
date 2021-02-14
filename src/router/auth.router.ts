import { Router } from "express";
import {
  loginUser,
  currentUser,
  registerUser,
  revokeRefreshTokensForUser,
  logout,
} from "../controller/auth.controller";
import { validate } from "../validators";
import { loginRule } from "../validators/auth/login.validate";
import { registerRule } from "../validators/auth/register.validate";
import passport from "passport";
import { sendCookieToken } from "../utils/sendCookieToken";
import { isAuth } from "../middlewares/isAuth";

const router = Router();

router.post("/login", loginRule, validate, loginUser);
router.post("/register", registerRule, validate, registerUser);
router.post("/logout", isAuth, logout);
router.post("/revoke_access", isAuth, revokeRefreshTokensForUser);
router.get("/me", isAuth, currentUser);

router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req: any, res) => {
    if (!req.user.accessToken || !req.user.refreshToken) {
      res.send(`something went wrong`);
      return;
    }
    sendCookieToken(res, {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    });

    res.redirect(`http://localhost:3000/`);
  }
);

export { router as authRouter };
