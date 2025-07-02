
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "../hooks/useAuthContext";

const EngineerSignup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const { signup, authLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Signup Failed", description: err });
      return;
    }

    try {
      const newUser = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "engineer",
        profileData: {
          country: "",
          skills: [],
          experience: "",
          availability: "Available",
          isVetted: false
        }
      });

      toast({ 
        title: "Signup Success! 🎉", 
        description: "Welcome to STECHAD. Complete your profile to get started." 
      });
      navigate("/onboarding", { state: { name: newUser.name, email: newUser.email } });
    } catch (error) {
      toast({ 
        title: "Signup Failed", 
        description: error.message || "An error occurred during signup" 
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Join STECHAD as Engineer</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
            autoFocus
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
          />
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            value={form.confirm}
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
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted cursor-pointer"
              disabled={authLoading}
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" className="w-5 h-5 mr-2" />
              LinkedIn
            </button>
          </div>
          <button
            type="submit"
            className={`w-full mt-2 bg-primary text-white font-bold rounded-md p-3 transition ${authLoading ? "opacity-60" : "hover:bg-primary-faint"}`}
            disabled={authLoading}
          >
            {authLoading ? "Creating Account..." : "Sign Up"}
          </button>
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

export default EngineerSignup;
