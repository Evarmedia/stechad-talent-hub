import { emailError } from "@/lib/authValidation";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const ForgotPassword = () => {
  const { sendOtp } = useAuthContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (emailError(email)) {
      setError(emailError(email));
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email.trim().toLowerCase());
      navigate("/reset-password");
    } catch (error) {
      setError(error.message || "Unable to send verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-primary mb-6 w-full text-center">Forgot Password?</h1>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            aria-label="Email address"
            aria-describedby="email-error"
            aria-invalid={Boolean(email && emailError(email))}
            autoComplete="email"
            autoCapitalize="none"
            className="p-3"
            disabled={loading}
          />
          {email && emailError(email) && <p id="email-error" className="text-sm text-destructive" aria-live="polite">{emailError(email)}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className={`mt-2 bg-primary text-white font-bold rounded-md p-3 transition ${loading ? "opacity-60" : "hover:bg-primary-faint"}`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
        <Link to="/login" className="mt-6 text-sm text-primary underline font-semibold">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
