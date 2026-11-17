import { MIN_PASSWORD_LENGTH, passwordError } from "@/lib/authValidation";

export function PasswordFeedback({ password, confirmation, reset = false }: {
  password: string;
  confirmation: string;
  reset?: boolean;
}) {
  return (
    <div id="password-feedback" className="space-y-1 text-xs" aria-live="polite">
      <p className={password ? (passwordError(password) ? "text-destructive" : "text-green-700") : "text-muted-foreground"}>
        {password && !passwordError(password) ? "✓ " : ""}At least {MIN_PASSWORD_LENGTH} characters
      </p>
      {reset && <p className="text-muted-foreground">Choose a password different from your current password.</p>}
      {confirmation && (
        <p className={password === confirmation ? "text-green-700" : "text-destructive"}>
          {password === confirmation ? "✓ Passwords match" : "Passwords do not match"}
        </p>
      )}
    </div>
  );
}
