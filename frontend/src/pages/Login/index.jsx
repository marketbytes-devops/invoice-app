import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Mail, ArrowRight } from "lucide-react";
import loginImage from "../../assets/images/MB.jpg";
import PasswordInput from "../../components/PasswordInput";

const Login = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/login/", {
        email: data.email,
        password: data.password,
      });
      const { access, refresh } = response.data;
      onLogin(access, refresh);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-5xl flex shadow-2xl rounded-3xl overflow-hidden bg-white">
        {/* Left Side - Image */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/90 text-lg">Sign in to continue to MarketBytes Invoice System</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <span className="text-white font-bold text-xl">MB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MarketBytes</h1>
              <p className="text-xs text-gray-500 font-medium">Invoice System</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
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
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs px-1">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <PasswordInput
              label="Password"
              name="password"
              register={register}
              rules={{ required: "Password is required" }}
              error={errors.password}
              placeholder="Enter your password"
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-black font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            © 2026 MarketBytes. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;