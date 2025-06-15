
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({
        title: "Email Sent",
        description: "If the email exists in our system, you'll receive instructions shortly.",
      });
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-primary mb-6 w-full text-center">Forgot Password?</h1>
        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3"
              disabled={loading}
            />
            <button
              type="submit"
              className={`mt-2 bg-primary text-white font-bold rounded-md p-3 transition ${loading ? "opacity-60" : "hover:bg-primary-faint"}`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center text-text-main py-7">
            Check your email for password reset instructions.
          </div>
        )}
        <Link to="/login" className="mt-6 text-sm text-primary underline font-semibold">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
