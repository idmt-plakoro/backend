import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { randomBytes } from "crypto";
import { newUser } from "../models/usersModel";
import { usersService } from "../services/usersService";

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
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
const lineClientId = process.env.LINE_CLIENT_ID || process.env.line_client_id;
const lineClientSecret = process.env.LINE_CLIENT_SECRET || process.env.line_client_secret;
const lineRedirectUri = process.env.LINE_REDIRECT_URI || process.env.line_redirect_uri;

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (!lineClientId || !lineClientSecret || !lineRedirectUri) {
  throw new Error("Missing required environment variables for Line OAuth: LINE_CLIENT_ID, LINE_CLIENT_SECRET, LINE_REDIRECT_URI");
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

async function fetchLineAccessToken(code: string): Promise<string> {
  try {
    const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: lineClientId!,
        client_secret: lineClientSecret!,
        redirect_uri: lineRedirectUri!,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Line access token fetch failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json() as { access_token: string };

    return data.access_token;
  } catch (error) {
    console.error("Error fetching Line access token:", error);
    throw new Error("Failed to fetch access token");
  }
}

async function fetchLineProfile(accessToken: string): Promise<LineProfile> {
  try {
    const response = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Line profile fetch failed with status ${response.status}: ${errorText}`);
    }
    const result = await response.json() as LineProfile;

    return result;
  } catch (error) {
    console.error("Error fetching Line profile:", error);
    throw new Error("Failed to fetch Line profile");
  }
}

export const lineAuthPlugin = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
    })
  )
  .get("/line", ({ redirect, cookie: { lineOAuthState } }) => {
    const state = generateOAuthState();

    lineOAuthState.value = state;
    applyCookieDefaults(lineOAuthState, OAUTH_STATE_MAX_AGE_SECONDS);

    const rootUrl = "https://access.line.me/oauth2/v2.1/authorize";
    const options = {
      redirect_uri: lineRedirectUri!,
      client_id: lineClientId!,
      response_type: "code",
      state,
      scope: "profile openid",
    };

    return redirect(`${rootUrl}?${new URLSearchParams(options).toString()}`);
  })
  .get("/line/callback", async ({ query, jwt, cookie: { lineOAuthState, session }, redirect, status }) => {
    if (!query.code) return status(400, "Authorization code missing");

    const receivedState = query.state as string | undefined;
    const expectedState = lineOAuthState.value;

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      return status(400, "Invalid OAuth state");
    }

    // Invalidate the one-time OAuth state value to prevent replay.
    lineOAuthState.value = "";
    applyCookieDefaults(lineOAuthState, 0);

    try {
      const accessToken = await fetchLineAccessToken(query.code as string);
      const profile = await fetchLineProfile(accessToken);

      let user = await usersService.findUserByGoogleId(profile.userId);
      if (!user) {
        const newU: newUser = {
          googleId: profile.userId,
          email: `${profile.userId}@line.me`,
          displayName: profile.displayName || "Line User",
          avatarUrl: profile.pictureUrl || "",
        };
        user = await usersService.createUser(newU);
      }

      const token = await jwt.sign({ id: user.id, email: user.email });

      session.value = token;
      applyCookieDefaults(session, SESSION_MAX_AGE_SECONDS);

      return redirect(process.env.FRONTEND_URL!);
    } catch (error) {
      console.error("Line authentication error:", error);
      return status(500, "Authentication failed");
    }
  });
