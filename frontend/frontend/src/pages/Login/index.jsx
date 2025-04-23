import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom"; // Added Link for navigation
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";
import loginImage from "../../assets/images/MB.jpg"; 

const Login = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${loginImage})` }}>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
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
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password..."
              register={register}
              required={true}
              error={errors.password}
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;