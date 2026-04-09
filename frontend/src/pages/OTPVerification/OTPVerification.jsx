import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Mail, Shield, ArrowRight } from "lucide-react";
import bgImage from "../../assets/images/MB-Team.webp";

const OTPVerification = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/otp-verification/", {
        email: email || data.email,
        otp: data.otp,
      });
      alert(response.data.message || "OTP verified successfully");
      navigate("/reset-password", { state: { email: email || data.email } });
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert(error.response?.data?.error || "Invalid or expired OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end bg-gray-50 px-20" style={{ backgroundImage: `url(${bgImage})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="max-w-md w-full flex shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
        {/* Right Side - Form */}
        <div className="w-full p-12">
          {/* Logo/Brand */}
          <h2 className="text-2xl font-bold text-black mb-2">Verify Your Identity</h2>
          <p className="text-sm text-black mb-8">
            {email ? `We've sent a verification code to ${email}` : "Enter your email and the OTP code"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input (if not provided) */}
            {!email && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-black uppercase tracking-widest px-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-black" />
                  </div>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    type="email"
                    className="w-full bg-gray-100 border-2 border-black rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-black"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs px-1">{errors.email.message}</p>}
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-black uppercase tracking-widest px-1">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-black" />
                </div>
                <input
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "OTP must be 6 digits"
                    }
                  })}
                  type="text"
                  maxLength={6}
                  className="w-full bg-gray-100 border-2 border-black rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-black tracking-widest text-center"
                  placeholder="000000"
                />
              </div>
              {errors.otp && <p className="text-red-500 text-xs px-1">{errors.otp.message}</p>}
            </div>

            {/* Resend OTP Link */}
            <div className="flex justify-center">
              <button
                type="button"
                className="text-sm text-black hover:text-black font-semibold transition-colors"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-black mt-8">
            © 2026 MarketBytes. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;