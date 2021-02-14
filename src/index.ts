import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { allRouter } from "./router/index";
import { createConnection } from "typeorm";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "./entities/User";
import { createTokens } from "./utils/createTokens";

const port = process.env.APP_PORT;

async function createServer() {
  try {
    await createConnection();
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.CLIENT_ID as string,
          clientSecret: process.env.CLIENT_SECRET as string,
          callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
        },
        async (googleAccessToken, _, profile, cb) => {
          try {
            let user = await User.findOne({ googleId: profile.id });
            const data: Partial<User> = {
              googleAccessToken,
              googleId: profile.id,
              photoUrl:
                profile.photos?.[0].value ||
                (profile._json as any).picture ||
                "",
              other: profile._json,
              email: profile.emails?.[0].value,
              username: profile.username,
            };

            if (user) {
              await User.update(user.id, data);
            } else {
              user = await User.create(data).save();
            }
            cb(undefined, createTokens(user));
          } catch (err) {
            console.log(err);
            cb(new Error("internal error"));
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.accessToken);
    });

    const app = express();

    app.use(
      cors({
        credentials: true,
        origin: "http://localhost:3000",
      })
    );
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(allRouter);

    app.listen({ port }, () => {
      console.log(`server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

createServer();
