import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { User, Building2, Lock, Camera, Mail, Save, Loader2, Upload, AtSign, ShieldCheck } from "lucide-react";
import apiClient from "../../api/apiClient";
import profilePic from "../../assets/images/profile-icon.jpg";
import ConfirmationModal from "../../components/ConfirmationModal";
import PasswordInput from "../../components/PasswordInput";
import ImageModal from "../../components/ImageModal";
import { useUser } from "../../context/UserContext";

const Profile = () => {
  const { updateUserAvatar, updateUserInfo } = useUser();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", type: "success" });
  const [previewImage, setPreviewImage] = useState({ isOpen: false, url: "", title: "" });

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors }
  } = useForm();

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm();

  const logoInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const BASE_URL = apiClient.defaults.baseURL.replace('/api', '');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, logoRes] = await Promise.all([
        apiClient.get('/auth/profile/'),
        apiClient.get('invoices/settings/logo/')
      ]);

      // Set Profile Data
      const userData = profileRes.data;
      setUserProfile(userData);
      setProfileValue('firstName', userData.first_name);
      setProfileValue('lastName', userData.last_name);
      setProfileValue('username', userData.username);
      setProfileValue('email', userData.email);

      // Set Logo Data
      if (logoRes.data.logo_image) {
        setLogoUrl(logoRes.data.logo_image);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Avatar Handling ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.put('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.avatar) {
        setUserProfile(prev => ({ ...prev, avatar: response.data.avatar }));
        updateUserAvatar(response.data.avatar);
      }
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- Logo Handling ---
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo_image", file);

      const response = await apiClient.post("invoices/settings/logo/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLogoUrl(response.data.logo_image);
      alert("Invoice logo updated!");
    } catch (error) {
      console.error("Logo upload error:", error);
      alert("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // --- Profile Update ---
  const onSubmitProfile = async (data) => {
    try {
      setSavingProfile(true);
      await apiClient.put("/auth/profile/", {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        email: data.email,
      });

      setModalContent({
        title: "Profile Updated",
        message: "Your profile information has been successfully updated.",
        type: "success"
      });
      setShowModal(true);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Password Reset ---
  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      setChangingPassword(true);
      await apiClient.post("/auth/change-password/", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_new_password: data.confirmPassword, // Backend expects this key? Or just ignores it if validated here
      });

      setModalContent({
        title: "Password Changed",
        message: "Your password has been successfully updated. Please use your new password next time you login.",
        type: "success"
      });
      setShowModal(true);

      resetPasswordForm();
    } catch (error) {
      console.error("Password change error:", error);
      alert("Failed to change password. Please check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getAvatarUrl = () => {
    if (userProfile?.avatar) {
      return `${BASE_URL}${userProfile.avatar}`;
    }
    return profilePic;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and invoice branding.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Right Column: Personal & Security */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Profile Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Personal Information</h2>
                <p className="text-xs text-gray-500 font-medium">Update your photo and personal details.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative group">
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:ring-4 hover:ring-black/10 transition-all"
                    onError={(e) => (e.target.src = profilePic)}
                    onClick={() => setPreviewImage({ isOpen: true, url: getAvatarUrl(), title: "Profile Picture" })}
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-gray-800 transition-colors"
                  >
                    {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{userProfile?.username || "User"}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
                    <input
                      {...registerProfile("firstName", { required: "First name is required" })}
                      className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-black/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Jane"
                    />
                    {profileErrors.firstName && <p className="text-red-500 text-xs">{profileErrors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                    <input
                      {...registerProfile("lastName")}
                      className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-black/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      {...registerProfile("email", { required: "Email is required" })}
                      className="w-full bg-gray-50 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-black/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                      placeholder="jane@example.com"
                    />
                  </div>
                  {profileErrors.email && <p className="text-red-500 text-xs">{profileErrors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      {...registerProfile("username", { required: "Username is required" })}
                      className="w-full bg-gray-50 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-black/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                      placeholder="janedoe"
                    />
                  </div>
                  {profileErrors.username && <p className="text-red-500 text-xs">{profileErrors.username.message}</p>}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Updating
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Update Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Security</h2>
                <p className="text-xs text-gray-500 font-medium">Manage your password and security preferences.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-5">
              <div className="space-y-1.5">
                <PasswordInput
                  label="Current Password"
                  name="currentPassword"
                  register={registerPassword}
                  rules={{ required: "Current password is required" }}
                  error={passwordErrors.currentPassword}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    register={registerPassword}
                    rules={{
                      required: "New password is required",
                      minLength: { value: 6, message: "Must be at least 6 characters" }
                    }}
                    error={passwordErrors.newPassword}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <PasswordInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    register={registerPassword}
                    rules={{ required: "Please confirm your password" }}
                    error={passwordErrors.confirmPassword}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-white border text-black hover:bg-black hover:text-white border-gray-300 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
        showButtons={false}
      />

      <ImageModal
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ ...previewImage, isOpen: false })}
        imageUrl={previewImage.url}
        title={previewImage.title}
      />
    </div>
  );
};

export default Profile;