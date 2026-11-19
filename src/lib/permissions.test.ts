import { describe, it, expect } from "vitest";
import { can, canAny } from "./permissions";
describe("effective permissions", () => {
  it("accepts canonical and legacy project grants and supports the wildcard", () => {
    expect(can({ effective_permissions: ["create_project"] }, "create_projects")).toBe(true);
    expect(can({ effective_permissions: ["create_projects"] }, "create_project")).toBe(true);
    expect(can({ effective_permissions: ["*"] }, "manage_staff")).toBe(true);
  });
  it("does not infer access from an admin role or missing permission data", () => {
    expect(can({ role: "admin", effective_permissions: [] }, "create_projects")).toBe(false);
    expect(can(null, "manage_staff")).toBe(false);
    expect(canAny({ effective_permissions: ["manage_kpis"] }, ["manage_staff", "manage_kpis"])).toBe(true);
  });
});
