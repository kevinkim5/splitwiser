import { scryptSync } from "crypto";

const SALT = process.env.SALT_SECRET;

// Function to hash a password
export function hashPassword(password: string): string {
  if (!SALT) throw new Error("Salt is not set");

  const hash = scryptSync(password, SALT, 64).toString("hex"); // Hash the password with the salt
  return hash;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!SALT) throw new Error("Salt is not set");
  const hash = scryptSync(password, SALT, 64).toString("hex"); // Hash the input password with the same salt
  return hash === storedHash; // Compare the hashes
}
