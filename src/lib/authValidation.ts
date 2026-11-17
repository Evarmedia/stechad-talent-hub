// Keep aligned with backend/utils/passwordPolicy.js.
export const MIN_PASSWORD_LENGTH = 6;
export const passwordError = (password: string) => [...password].length < MIN_PASSWORD_LENGTH
  ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` : "";
export const emailError = (email: string) => /^\S+@\S+\.\S+$/.test(email.trim())
  ? "" : "Enter a valid email address";
