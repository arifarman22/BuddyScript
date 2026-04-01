import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
