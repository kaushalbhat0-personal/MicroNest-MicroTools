import { describe, expect, it } from "vitest";
import { canMutateClients, canViewClients } from "../client-permissions";

describe("client-permissions", () => {
  it("owner/admin can mutate, member cannot", () => {
    expect(canMutateClients("owner")).toBe(true);
    expect(canMutateClients("admin")).toBe(true);
    expect(canMutateClients("member")).toBe(false);
    expect(canMutateClients(null)).toBe(false);
  });

  it("all members can view", () => {
    expect(canViewClients("owner")).toBe(true);
    expect(canViewClients("member")).toBe(true);
    expect(canViewClients(null)).toBe(false);
  });

  it("forged role denied", () => {
    expect(canMutateClients("superadmin" as never)).toBe(false);
  });
});
