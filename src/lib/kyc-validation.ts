import { z } from "zod";

export const KYC_MAX_BYTES = 10 * 1024 * 1024;
export const kycPathsSchema = z.object({
  identityPath: z.string().min(1).max(240),
  addressPath: z.string().min(1).max(240),
}).refine(value => value.identityPath !== value.addressPath, "Two different documents are required.");

export function validateKycFile(file: { name: string; size: number; type: string }) {
  if (!/\.(jpe?g|png|pdf)$/i.test(file.name) || !["image/jpeg", "image/png", "application/pdf"].includes(file.type)) return "Choose a JPG, JPEG, PNG, or PDF file.";
  if (file.size <= 0 || file.size > KYC_MAX_BYTES) return "Each document must be non-empty and no larger than 10MB.";
  return "";
}