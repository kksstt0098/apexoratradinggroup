export function validateInviteCode(code: string): string | null {
  return code.trim() === "" || /^\d{6}$/.test(code.trim())
    ? null
    : "Invite code must contain 6 digits.";
}

export async function checkInviteCode(code: string, exists: (code: string) => Promise<boolean>) {
  const error = validateInviteCode(code);
  if (error) throw new Error(error);
  const normalized = code.trim();
  if (normalized && !(await exists(normalized))) throw new Error("Invalid invite code. Please check and try again.");
  return normalized || undefined;
}