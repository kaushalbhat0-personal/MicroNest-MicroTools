import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "../auth-schema";

describe("auth-schema", () => {
  it("signUp requires name/email/password", () => {
    const r = signUpSchema.safeParse({ name: "", email: "bad", password: "123" });
    expect(r.success).toBe(false);
  });

  it("signUp accepts valid", () => {
    const r = signUpSchema.safeParse({ name: "CA One", email: "ca@example.com", password: "secret12" });
    expect(r.success).toBe(true);
  });

  it("signIn requires email/password", () => {
    expect(signInSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(signUpSchema.safeParse({ name: "x", email: "not-email", password: "secret12" }).success).toBe(false);
  });
});
