import { PasswordFeedback } from "@/components/PasswordFeedback";
import { emailError, passwordError } from "@/lib/authValidation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";


const TalentSignup = () => {
  const params = new URLSearchParams(window.location.search);
  const refQuery = params.get("referral")

  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", confirm_password: "", googleSignIn: false, referral_code: refQuery ?? "", });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, authLoading, googleLogin } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.first_name.trim()) return "First Name required";
    if (!form.last_name.trim()) return "Last Name required";
    if (emailError(form.email)) return emailError(form.email);
    if (passwordError(form.password)) return passwordError(form.password);
    if (form.password !== form.confirm_password) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      const response = await signup({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        referral_code: form.referral_code,
        role: "talent"
      });

      toast({
        title: "Signup Success! 🎉",
        description: "Welcome to STECHAD. Complete your profile to get started."
      });
      const newUser = response.data.user;
      navigate("/onboarding", { state: { first_name: newUser.first_name, email: newUser.email } });
    } catch (error) {
      setError(error.message || "An error occurred during signup");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Join STECHAD as Talent</h1>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
            autoFocus
          /> 
          {submitted && !form.first_name.trim() && <p className="text-xs text-destructive">First Name required</p>}
          <Input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
          />
          {submitted && !form.last_name.trim() && <p className="text-xs text-destructive">Last Name required</p>}
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            aria-label="Email Address"
            aria-invalid={Boolean((form.email || submitted) && emailError(form.email))}
            aria-describedby="signup-email-error"
            autoComplete="email"
            autoCapitalize="none"
            value={form.email}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
          />
          {(form.email || submitted) && emailError(form.email) && <p id="signup-email-error" className="text-xs text-destructive" aria-live="polite">{emailError(form.email)}</p>}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              aria-label="Password"
              aria-describedby="password-feedback"
              aria-invalid={Boolean(form.password && passwordError(form.password))}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-3 pr-10"
              disabled={authLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={authLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              aria-label="Confirm Password"
              aria-describedby="password-feedback"
              aria-invalid={Boolean(form.confirm_password && form.password !== form.confirm_password)}
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={handleChange}
              className="p-3 pr-10"
              disabled={authLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={authLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <PasswordFeedback password={form.password} confirmation={form.confirm_password} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Input
            type="text"
            name="referral_code"
            placeholder="Referral Code(Optional)"
            value={form.referral_code}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
          />
          {/* Social signup */}
          <div className="flex gap-3 justify-center pt-1">
            <button
              type="button"
              className="flex items-center px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted cursor-pointer"
              disabled={authLoading}
              onClick={googleLogin}
            >
              <img src="https://img.icons8.com/external-those-icons-flat-those-icons/96/external-Google-logos-and-brands-those-icons-flat-those-icons.png" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted cursor-pointer"
              disabled
              title={`Coming soon`}
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" className="w-5 h-5 mr-2" />
              LinkedIn
            </button>
          </div>
          <Button
            type="submit"
            className={`w-full mt-2 bg-primary text-white font-bold rounded-md p-3 transition ${authLoading ? "opacity-60" : "hover:bg-primary-faint"}`}
            disabled={authLoading}
          >
            {authLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <div className="text-center text-sm text-text-muted mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TalentSignup;
