import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { randomBytes } from "crypto";
import { newUser } from "../models/usersModel";
import { usersService } from "../services/usersService";

interface GoogleUser {
  sub: string;
  displayName: string;
  email: string;
  picture: string;
}

type CookieWithDefaults = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

function applyCookieDefaults(cookie: CookieWithDefaults, maxAge: number): void {
  cookie.httpOnly = true;
  cookie.maxAge = maxAge;
  cookie.path = "/";
  cookie.sameSite = "lax";
  cookie.secure = IS_PRODUCTION;
}

function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

async function fetchGoogleAccessToken(code: string): Promise<string> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google access token fetch failed with status ${response.status}`);
    }
    
    const data = await response.json() as { access_token: string };

    return data.access_token;
  } catch (error) {
    console.error("Error fetching Google access token:", error);
    throw new Error("Failed to fetch access token");
  }
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleUser> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Google profile fetch failed with status ${response.status}`);
    }
    const result= await response.json();

    return {
      sub: result.sub,
      displayName: result.name,
      email: result.email,
      picture: result.picture,
    };
  } catch (error) {
    console.error("Error fetching Google profile:", error);
    throw new Error("Failed to fetch Google profile");
  }
}

export const googleAuthPlugin = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
    })
  )
  .get("/google", ({ redirect, cookie: { googleOAuthState } }) => {
    const state = generateOAuthState();

    googleOAuthState.value = state;
    applyCookieDefaults(googleOAuthState, OAUTH_STATE_MAX_AGE_SECONDS);

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      state,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    return redirect(`${rootUrl}?${new URLSearchParams(options).toString()}`);
  })
  .get("/google/callback", async ({ query, jwt, cookie: { googleOAuthState, session }, redirect, status }) => {
    if (!query.code) return status(400, "Authorization code missing");

    const receivedState = query.state as string | undefined;
    const expectedState = googleOAuthState.value;

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      return status(400, "Invalid OAuth state");
    }

    // Invalidate the one-time OAuth state value to prevent replay.
    googleOAuthState.value = "";
    applyCookieDefaults(googleOAuthState, 0);

    try {
      const accessToken = await fetchGoogleAccessToken(query.code as string);
      const profile = await fetchGoogleProfile(accessToken);

      let user = await usersService.findUserByGoogleId(profile.sub);
      if (!user) {
        const newU: newUser = {
          googleId: profile.sub,
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.picture,
        };
        user = await usersService.createUser(newU);
      }

      const token = await jwt.sign({ id: user.id, email: user.email });

      session.value = token;
      applyCookieDefaults(session, SESSION_MAX_AGE_SECONDS);

      return redirect(process.env.FRONTEND_URL!);
    } catch (error) {
      console.error("Google authentication error:", error);
      return status(500, "Authentication failed");
    }
  });
