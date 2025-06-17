
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter a 6-digit code." });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate successful verification
      if (otp === "123456") {
        navigate("/reset-password");
      } else {
        toast({ 
          title: "Invalid Code", 
          description: "The code you entered is incorrect. Please try again.",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const handleResend = () => {
    setCanResend(false);
    setCountdown(30);
    toast({ title: "Code Sent", description: "A new verification code has been sent to your email." });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-smooth rounded-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">Verify Your Email</h1>
        <p className="text-center text-text-main mb-8 text-sm">
          We've sent a 6-digit code to your email address. Please enter it below.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-center">
          <div className="space-y-2">
            <InputOTP 
              maxLength={6} 
              value={otp} 
              onChange={(value) => setOtp(value)}
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
            <p className="text-xs text-muted-foreground text-center">
              For demo purposes, use code: 123456
            </p>
          </div>

          <button
            type="submit"
            className={`w-full bg-primary text-white font-bold rounded-md p-3 transition ${loading ? "opacity-60" : "hover:bg-primary-faint"}`}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

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

        <Link to="/login" className="mt-4 text-sm text-primary underline font-semibold">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyOTP;
