import { describe, expect, it, vi } from "vitest";
import { checkInviteCode, validateInviteCode } from "@/lib/signup-validation";

describe("Invitation rules", () => {
  it("allows signup without an invitation", async () => {
    const exists = vi.fn();
    expect(await checkInviteCode("", exists)).toBeUndefined();
    expect(exists).not.toHaveBeenCalled();
  });
  it("requires six numeric digits when supplied", () => {
    expect(validateInviteCode("123456")).toBeNull();
    expect(validateInviteCode("12345")).not.toBeNull();
    expect(validateInviteCode("1234567")).not.toBeNull();
    expect(validateInviteCode("ABCDEF")).not.toBeNull();
  });
  it("rejects nonexistent codes", async () => {
    await expect(checkInviteCode("123456", async () => false)).rejects.toThrow("Invalid invite code");
  });
  it("passes the valid personal code to signup", async () => {
    const exists = vi.fn(async () => true);
    expect(await checkInviteCode(" 012345 ", exists)).toBe("012345");
    expect(exists).toHaveBeenCalledWith("012345");
  });
});