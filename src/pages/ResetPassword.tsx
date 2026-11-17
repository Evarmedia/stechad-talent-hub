import { PasswordFeedback } from "@/components/PasswordFeedback";
import { passwordError } from "@/lib/authValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

const ResetPassword = () => {
  const { resetPassword } = useAuthContext();
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [formData, setFormData] = useState({
    otp: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle OTP change
  const handleOTPChange = (newValue: string) => {
    setError("");
    setFormData({
      ...formData,
      otp: newValue,  // Handle OTP input change
    });
  };

  // Handle input change (for password and confirmPassword)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Dynamically set password or confirmPassword
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordError(formData.new_password)) {
      toast({
        title: "Password Too Short",
        description: passwordError(formData.new_password),
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

    if (!/^\d{6}$/.test(formData.otp)) {
      setError("Enter the 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(formData);
      navigate("/login");
    } catch (error) {
      setError(error.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCanResend(false);
    setCountdown(30);
    navigate("/forgot-password");
  };

  return (
    <>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-primary mb-2 text-center">Reset Password</h1>
          <p className="text-center text-text-main mb-8 text-sm">
            Please enter your OTP and new password below.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="space-y-2">
              {/* OTP input */}
              <div className="flex flex-col gap-6 w-full items-center">
                <div className="space-y-2">
                  <InputOTP
                    maxLength={6}
                    pattern="[0-9]*"
                    aria-label="Verification code"
                    value={formData.otp}
                    onChange={handleOTPChange}  // Call the OTP-specific handler
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-muted-foreground text-center text-red-600">
                    Code Expires in 10 mins
                  </p>
                </div>
              </div>

              <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  name="new_password"
                  autoComplete="new-password"
                  aria-describedby="password-feedback"
                  aria-invalid={Boolean(formData.new_password && passwordError(formData.new_password))}
                  placeholder="Enter new password"
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

            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirm_password"
                  autoComplete="new-password"
                  aria-describedby="password-feedback"
                  aria-invalid={Boolean(formData.confirm_password && formData.new_password !== formData.confirm_password)}
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

            <PasswordFeedback password={formData.new_password} confirmation={formData.confirm_password} reset />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full mt-4 text-white"
              disabled={loading || Boolean(passwordError(formData.new_password)) || formData.new_password !== formData.confirm_password || !/^\d{6}$/.test(formData.otp)}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          {/* resend code */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-primary underline font-semibold"
              >
                Resend Code
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          <Link to="/login" className="mt-6 text-sm text-primary underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
