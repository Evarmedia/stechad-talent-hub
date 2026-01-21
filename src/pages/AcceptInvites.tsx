import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useLocation } from "react-router-dom";

const ResetPassword = () => {
  const { acceptInvites } = useAuthContext();
  const [formData, setFormData] = useState({
    temp_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");


  // Handle input change (for password and confirmPassword)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Dynamically set password or confirmPassword
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // console.log("Resetting password with:", formData);
    await acceptInvites(token, formData);
    navigate("/login");
  };

  return (
    <>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-primary mb-2 text-center">Reset Password</h1>
          <p className="text-center text-text-main mb-8 text-sm">
            Welcome! Please Reset Your password using the Old password sent to your email to gain access to your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temporary Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="temp_password"
                  placeholder="Enter new password"
                  value={formData.temp_password}
                  onChange={handleInputChange}  // Call the input change handler
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  placeholder="Enter Temporary password"
                  value={formData.new_password}
                  onChange={handleInputChange}  // Call the input change handler
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
                  name="confirm_password"
                  placeholder="Confirm new password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}  // Call the input change handler
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
              className="w-full mt-4 text-white"
              disabled={loading || !formData.new_password || !formData.confirm_password}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <Link to="/login" className="mt-6 text-sm text-primary underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
