import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Mail, ArrowRight } from "lucide-react";
import PasswordInput from "../../components/PasswordInput";
import bgImage from "../../assets/images/MB-Team.webp";

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
    <div className="min-h-screen flex items-center justify-end bg-gray-50 px-20" style={{ backgroundImage: `url(${bgImage})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }}>

      <div className="max-w-md w-full flex shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
        {/* Right Side - Form */}
        <div className="w-full p-12">
          <h2 className="text-2xl font-bold text-black mb-2">Welcome Back</h2>
          <p className="text-sm text-black mb-8">Enter your credentials to continue to MarketBytes Invoice System</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
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
                className="text-sm text-black hover:text-black font-semibold transition-colors"
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
          <p className="text-center text-sm text-black mt-8">
            © 2026 MarketBytes. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;