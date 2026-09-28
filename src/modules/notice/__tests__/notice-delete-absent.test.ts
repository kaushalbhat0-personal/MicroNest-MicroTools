import { describe, expect, it } from "vitest";
import * as repo from "../repositories/notice-repository";
import * as perms from "../permissions/notice-permissions";

describe("notice delete absent in Phase 2B", () => {
  it("repository exposes no delete operation", () => {
    expect((repo as Record<string, unknown>).deleteNotice).toBeUndefined();
    expect((repo as Record<string, unknown>).removeNotice).toBeUndefined();
  });
  it("permissions expose no delete", () => {
    expect((perms as Record<string, unknown>).canDeleteNotice).toBeUndefined();
  });
  it("workflow transitions remain absent", () => {
    expect((perms as Record<string, unknown>).canTransition).toBeUndefined();
  });
  it("activity_log remains absent", () => {
    expect((repo as Record<string, unknown>).createActivity).toBeUndefined();
  });
});
