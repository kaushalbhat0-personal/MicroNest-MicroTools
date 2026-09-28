import { describe, expect, it } from "vitest";
import { createFirmSchema, slugify } from "../firm-schema";

describe("firm-schema", () => {
  it("requires name min 2", () => {
    expect(createFirmSchema.safeParse({ name: "x" }).success).toBe(false);
    expect(createFirmSchema.safeParse({ name: "Acme CA" }).success).toBe(true);
  });

  it("trims name", () => {
    const r = createFirmSchema.safeParse({ name: "  Acme  " });
    expect(r.success && r.data.name).toBeDefined();
  });

  it("slugify normalizes", () => {
    expect(slugify("Acme CA Associates")).toBe("acme-ca-associates");
    expect(slugify("  Hello  World!! ")).toBe("hello-world");
    expect(slugify("!!!")).toBe("firm");
  });
});
