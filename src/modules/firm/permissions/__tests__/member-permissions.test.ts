import { describe, expect, it } from "vitest";
import { canUpdateRole } from "../member-permissions";

describe("member-permissions", () => {
  it("member cannot manage", () => {
    expect(canUpdateRole({ actorRole: "member", targetRole: "member", newRole: "admin" }).allowed).toBe(false);
  });

  it("non-member cannot", () => {
    expect(canUpdateRole({ actorRole: null, targetRole: "member", newRole: "admin" }).allowed).toBe(false);
  });

  it("owner/admin can member→admin", () => {
    expect(canUpdateRole({ actorRole: "owner", targetRole: "member", newRole: "admin" }).allowed).toBe(true);
    expect(canUpdateRole({ actorRole: "admin", targetRole: "member", newRole: "admin" }).allowed).toBe(true);
  });

  it("owner/admin can admin→member", () => {
    expect(canUpdateRole({ actorRole: "owner", targetRole: "admin", newRole: "member" }).allowed).toBe(true);
  });

  it("cannot change owner role", () => {
    expect(canUpdateRole({ actorRole: "owner", targetRole: "owner", newRole: "admin" }).allowed).toBe(false);
    expect(canUpdateRole({ actorRole: "admin", targetRole: "owner", newRole: "member" }).allowed).toBe(false);
  });

  it("cannot promote to owner — escalation blocked", () => {
    expect(canUpdateRole({ actorRole: "owner", targetRole: "member", newRole: "owner" }).allowed).toBe(false);
    expect(canUpdateRole({ actorRole: "admin", targetRole: "member", newRole: "owner" }).allowed).toBe(false);
    expect(canUpdateRole({ actorRole: "member", targetRole: "member", newRole: "owner" }).allowed).toBe(false);
  });

  it("MEMBER→ADMIN denied, ADMIN→OWNER denied", () => {
    expect(canUpdateRole({ actorRole: "member", targetRole: "member", newRole: "admin" }).allowed).toBe(false);
    expect(canUpdateRole({ actorRole: "admin", targetRole: "admin", newRole: "owner" }).allowed).toBe(false);
  });

  it("forged role string denied", () => {
    expect(canUpdateRole({ actorRole: "superadmin" as never, targetRole: "member", newRole: "admin" }).allowed).toBe(false);
  });
});
