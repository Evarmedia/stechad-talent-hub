
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "../hooks/useAuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "engineer" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, authLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");
    if (r === "engineer" || r === "project_manager" || r === "admin") setForm((f) => ({ ...f, role: r }));
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email required";
    if (!form.password) return "Password is required";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Login Failed", description: err });
      return;
    }

    try {
      const response = await login(form.email, form.password, form.role);
      toast({ title: `Welcome ${response.data.user.first_name}`, description: "Login successful!" });
      
      // Navigate based on role and onboarding status
      if (from !== "/") {
        navigate(from, { replace: true });
      } else {
        if (form.role === "engineer") {
          // Check if engineer has completed onboarding
          if (!response.data.user.engineer.is_onboarded) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard/engineer");
          }
        } else if (form.role === "project_manager") {
          navigate("/dashboard/pm");
        } else if (form.role === "admin") {
          navigate("/admin");
        }
      }
    } catch (error) {
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid credentials" 
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-8">Login to STECHAD</h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-3 mb-2 border border-border rounded"
            disabled={authLoading}
          >
            <option value="engineer">Engineer</option>
            <option value="project_manager">Project Manager</option>
            <option value="admin">Admin (Staff Only)</option>
          </select>
          <Input
            type="email"
            name="email"
            placeholder="jane.doe@example.com"
            value={form.email}
            onChange={handleChange}
            className="p-3"
            disabled={authLoading}
            autoFocus
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-3 pr-10"
              disabled={authLoading}
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
          <Button
            type="submit"
            className={`w-full mt-2 bg-primary text-white font-bold rounded-md p-3 transition ${authLoading ? "opacity-60" : "hover:bg-primary-faint"}`}
            disabled={authLoading}
          >
            {authLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-text-muted mt-4 gap-2">
          <Link to="/forgot-password" className="text-primary font-semibold underline text-center">Forgot password?</Link>
          <div>
            New engineer?{" "}
            <Link to="/engineer-signup" className="text-primary font-semibold underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
