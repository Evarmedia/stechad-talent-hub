
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      toast({ 
        title: "Password Too Short", 
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ 
        title: "Passwords Don't Match", 
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: "Password Reset Successful", 
        description: "Your password has been updated successfully." 
      });
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">Reset Password</h1>
        <p className="text-center text-text-main mb-8 text-sm">
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={loading || !formData.password || !formData.confirmPassword}
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>

        <Link to="/login" className="mt-6 text-sm text-primary underline font-semibold">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
