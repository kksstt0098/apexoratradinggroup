import { describe, expect, it } from "vitest";
import { kycPathsSchema, validateKycFile } from "@/lib/kyc-validation";

describe("KYC document rules", () => {
  it("accepts JPG, JPEG, PNG and PDF", () => {
    for (const { name, type } of [{ name: "id.jpg", type: "image/jpeg" }, { name: "id.jpeg", type: "image/jpeg" }, { name: "id.png", type: "image/png" }, { name: "bill.pdf", type: "application/pdf" }]) expect(validateKycFile({ name, type, size: 100 })).toBe("");
    expect(validateKycFile({ name: "file.exe", type: "application/octet-stream", size: 100 })).not.toBe("");
  });
  it("enforces the 10MB limit", () => {
    expect(validateKycFile({ name: "id.png", type: "image/png", size: 10485760 })).toBe("");
    expect(validateKycFile({ name: "id.png", type: "image/png", size: 10485761 })).not.toBe("");
    expect(validateKycFile({ name: "id.png", type: "image/png", size: 0 })).not.toBe("");
  });
  it("requires two distinct documents", () => {
    expect(kycPathsSchema.safeParse({ identityPath: "u/id.png", addressPath: "u/bill.pdf" }).success).toBe(true);
    expect(kycPathsSchema.safeParse({ identityPath: "u/id.png", addressPath: "u/id.png" }).success).toBe(false);
    expect(kycPathsSchema.safeParse({ identityPath: "u/id.png", addressPath: "" }).success).toBe(false);
  });
});