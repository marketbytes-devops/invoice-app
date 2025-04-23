import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";
import loginImage from "../../assets/images/MB.jpg";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/forgot-password/", {
        email: data.email,
      });
      alert(response.data.message || "OTP sent to your email");
      navigate("/otp-verification", { state: { email: data.email } });
    } catch (error) {
      console.error("Forgot password failed:", error);
      alert(error.response?.data?.error || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${loginImage})` }}>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email..."
              register={register}
              required={true}
              error={errors.email}
            />
            <div className="text-right">
              <Link
                to="/login"
                className="text-sm text-gray-800 hover:underline"
              >
                Click here to go login...
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              Send OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;