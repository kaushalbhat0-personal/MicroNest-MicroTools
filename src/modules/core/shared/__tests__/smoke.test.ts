import { describe, expect, it } from "vitest";
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "../errors";
import { cn } from "@/lib/utils";

describe("core/shared — Phase 0 smoke", () => {
  it("AppError carries code and status", () => {
    const err = new ValidationError("bad input", { name: ["required"] });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ name: ["required"] });
  });

  it("NotFound/Unauthorized/Forbidden map to correct codes", () => {
    expect(new NotFoundError("Notice").code).toBe("NOT_FOUND");
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it("AppError is instanceof Error", () => {
    expect(new AppError("x", 500, "INTERNAL")).toBeInstanceOf(Error);
  });

  it("cn merges tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", undefined, "font-bold")).toContain("font-bold");
  });
});
