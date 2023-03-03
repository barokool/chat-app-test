import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { SESSION_SECRET } from "~/constants/env";
import { parseJwt } from "../auth/jwt";

const sessionSecret = SESSION_SECRET;

if (!sessionSecret) throw new Error("Session secret is required");

export const storage = createCookieSessionStorage({
  cookie: {
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secrets: [sessionSecret],
    name: "__tmdtSession",
    secure: true,
  },
});

export const createUserSession = async (
  userToken: string,
  redirectTo: string
) => {
  const session = await storage.getSession();
  session.set("accessToken", userToken);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const getUserSession = async (request: Request) => {
  return await storage.getSession(request.headers.get("cookie"));
};

export const checkTokenValid = (userToken: string) => {
  const parseJWT = parseJwt(userToken);
  if (parseJWT) {
    const currentDate = new Date();
    const expireDateToken = new Date(parseJWT.exp * 1000);
    const stillValid = expireDateToken > currentDate;
    if (!stillValid) {
      return false;
    }
  }
  return true;
};

export const logout = async (request: Request, redirectTo: string) => {
  const session = await getUserSession(request);
  if (redirectTo)
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.destroySession(session),
      },
    });
};

export const requireUserValidToken = async (
  request: Request,
  redirectTo = "/login"
) => {
  const session = await getUserSession(request);
  const userToken = session.get("accessToken");

  //1. no token
  if (!userToken || typeof userToken !== "string") return redirect(redirectTo);

  //2.have token but invalid
  const validToken = checkTokenValid(userToken);
  if (!validToken) return logout(request, redirectTo);
  return userToken;
};

export const getUserToken = async (request: Request) => {
  const session = await getUserSession(request);
  const userToken = session.get("accessToken");

  if (!userToken || typeof userToken !== "string") return null;
  const validToken = checkTokenValid(userToken);
  if (!validToken) return null;
  return userToken;
};

export const getCookieByName = (cookie: string | null, name?: string) => {
  if (!cookie || !name) return;
  const cookieArr = cookie.split(";");
  return (
    cookieArr
      .find((str: string) => str.split("=")[0]?.trim() === name)
      ?.split("=")[1] || ""
  );
};
