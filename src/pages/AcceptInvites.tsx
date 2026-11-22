import { PasswordFeedback } from "@/components/PasswordFeedback";
import { passwordError } from "@/lib/authValidation";
import { personalBasePath } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function AcceptInvites() {
  const { user, acceptInvites, selectOrganization } = useAuthContext();
  const [form, setForm] = useState({ first_name: "", last_name: "", new_password: "", confirm_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  useEffect(() => { document.title = "Accept invitation | STECHAD"; }, []);

  const accept = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (!token) { setError("The invite link is missing. Open the complete link from your invitation email."); return; }
    if (!user && (passwordError(form.new_password) || form.new_password !== form.confirm_password)) {
      setError(passwordError(form.new_password) || "Passwords do not match."); return;
    }
    setPending(true);
    try {
      const response = await acceptInvites(token, user ? {} : form);
      if (user) {
        const session = await selectOrganization(response.data.organization_id);
        navigate(personalBasePath(session?.data?.user), { replace: true });
      } else setAccepted(true);
    } catch (failure) {
      setError(failure.message || "Could not accept this invitation. Try again or request a new link.");
    } finally { setPending(false); }
  };
  const update = (name: keyof typeof form, value: string) => { setError(""); setForm((current) => ({ ...current, [name]: value })); };

  return <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
    <section className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-smooth">
      <div><h1 className="text-center text-2xl font-bold text-primary">Accept invitation</h1>
        <p className="mt-2 text-center text-sm text-text-main">{user ? `Accept this invitation as ${user.email}. Your existing password stays the same.` : "Create an account to join this organization, or sign in with your existing account."}</p></div>
      {accepted ? <p role="status">Invitation accepted. Sign in to continue.</p> : <form noValidate onSubmit={accept} className="space-y-4">
        {!user && <>
          <div className="space-y-2"><label htmlFor="invite-first-name" className="text-sm font-medium">First name</label><Input id="invite-first-name" autoComplete="given-name" placeholder="Enter first name" value={form.first_name} onChange={(event) => update("first_name", event.target.value)} disabled={pending} /></div>
          <div className="space-y-2"><label htmlFor="invite-last-name" className="text-sm font-medium">Last name</label><Input id="invite-last-name" autoComplete="family-name" placeholder="Enter last name" value={form.last_name} onChange={(event) => update("last_name", event.target.value)} disabled={pending} /></div>
          <div className="space-y-2"><label htmlFor="invite-password" className="text-sm font-medium">New password</label><div className="relative"><Input id="invite-password" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-describedby="password-feedback" aria-invalid={Boolean(form.new_password && passwordError(form.new_password))} placeholder="Enter new password" value={form.new_password} onChange={(event) => update("new_password", event.target.value)} disabled={pending} className="pr-10" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={pending} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div className="space-y-2"><label htmlFor="invite-confirmation" className="text-sm font-medium">Confirm password</label><div className="relative"><Input id="invite-confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" aria-describedby="password-feedback" aria-invalid={Boolean(form.confirm_password && form.confirm_password !== form.new_password)} placeholder="Confirm new password" value={form.confirm_password} onChange={(event) => update("confirm_password", event.target.value)} disabled={pending} className="pr-10" /><button type="button" aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmation} disabled={pending} onClick={() => setShowConfirmation(!showConfirmation)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none">{showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <PasswordFeedback password={form.new_password} confirmation={form.confirm_password} />
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" aria-busy={pending} disabled={pending || !token || (!user && (Boolean(passwordError(form.new_password)) || form.new_password !== form.confirm_password))} className="min-h-10 w-full cursor-pointer whitespace-normal active:bg-primary-faint">{pending ? "Accepting invitation…" : user ? "Accept invitation" : "Create account and accept invitation"}</Button>
      </form>}
      {!token && <p role="alert" className="text-sm text-destructive">The invitation link is missing. Open the complete link from your email.</p>}
      {!user && <Link to="/login" state={accepted ? undefined : { from: location }} className="block text-center text-sm font-semibold text-primary underline hover:text-primary-faint focus-visible:ring-2 focus-visible:ring-primary">{accepted ? "Sign in to continue" : "Sign in to accept invitation"}</Link>}
    </section>
  </div>;
}
