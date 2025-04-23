import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";
import profilePic from "../../assets/images/profile-icon.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [profileImage, setProfileImage] = useState(profilePic);
  const [showResetForm, setShowResetForm] = useState(false);

  const BASE_URL = apiClient.defaults.baseURL.replace('/api', ''); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        const userData = response.data;
        setValue('name', `${userData.first_name} ${userData.last_name}`.trim());
        setValue('username', userData.username);
        setValue('email', userData.email);
        if (userData.avatar) {
          const fullImageUrl = `${BASE_URL}${userData.avatar}`;
          setProfileImage(fullImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [setValue, BASE_URL]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); 
      setProfileImage(imageUrl);
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const response = await apiClient.put('/auth/profile/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.avatar) {
          setProfileImage(`${BASE_URL}${response.data.avatar}`);
        }
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        setProfileImage(profilePic);
      }
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      const [first_name, ...last_name] = data.name.split(' ');
      await apiClient.put("/auth/profile/", {
        first_name,
        last_name: last_name.join(' ') || '',
        username: data.username,
        email: data.email,
      });
      alert("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      alert("Failed to update profile. Please try again.");
      console.error(error);
    }
  };

  const onSubmitResetPassword = async (data) => {
    try {
      await apiClient.post("/auth/change-password/", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_new_password: data.newPassword,
      });
      alert("Password reset successfully!");
      setShowResetForm(false);
    } catch (error) {
      alert("Failed to reset password. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-center my-8">
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              onError={(e) => (e.target.src = profilePic)}
            />
            <label className="absolute bottom-2 right-0 px-2.5 py-1 bg-black text-white hover:bg-white hover:text-black border text-sm font-bold transition-colors duration-300 rounded-full cursor-pointer">
              +
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Full Name"
              placeholder="Enter your name..."
              name="name"
              register={register}
              error={errors.name}
            />
            <FormField
              label="Username"
              placeholder="Enter username..."
              name="username"
              register={register}
              error={errors.username}
            />
            <FormField
              label="Email"
              placeholder="Enter email..."
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white hover:bg-white hover:text-black border text-sm font-bold px-3 py-3 rounded w-full transition-colors duration-300"
          >
            Save Profile
          </button>
        </form>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Change Password
          </h3>
          <p className="text-gray-600 mb-4">
            Update your password here.
          </p>
          <button
            onClick={() => setShowResetForm(!showResetForm)}
            className="bg-black text-white hover:bg-white hover:text-black border text-sm font-bold px-3 py-3 rounded w-full transition-colors duration-300"
          >
            {showResetForm ? "Cancel" : "Change Password"}
          </button>
        </div>
        {showResetForm && (
          <form
            onSubmit={handleSubmit(onSubmitResetPassword)}
            className="mt-6 space-y-6 border-t pt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Current Password"
                placeholder="Enter current password..."
                name="currentPassword"
                type="password"
                register={register}
                error={errors.currentPassword}
              />
              <FormField
                label="New Password"
                placeholder="Enter new password..."
                name="newPassword"
                type="password"
                register={register}
                error={errors.newPassword}
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white hover:bg-white hover:text-black border text-sm font-bold px-3 py-3 rounded w-full transition-colors duration-300"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;