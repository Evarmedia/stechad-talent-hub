
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { Camera, Loader2, X, ZoomIn } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  city: string;
  country: string;
  permissions: string;
  is_super_admin: boolean;
  avatar: File | null;
  avatar_preview: string;
}

const AdminProfile = () => {
  const { user, updateProfile, authLoading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    city: "",
    country: "",
    permissions: "",
    is_super_admin: false,
    avatar: null,
    avatar_preview: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
        city: user.city || "",
        country: user.country || "",
        permissions: user.admin?.permissions?.join(", ") || "",
        is_super_admin: user.role === "super_admin",
      }));

      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please select an image file" });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size must be less than 2MB" });
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({ title: "Info", description: "First name and last name are required" });
      return;
    }

    setLoading(true);

    try {
      const profileData = new FormData();

      profileData.append("first_name", formData.first_name.trim());
      profileData.append("last_name", formData.last_name.trim());
      profileData.append("phone_number", formData.phone_number);
      profileData.append("city", formData.city);
      profileData.append("country", formData.country);

      if (formData.avatar) {
        profileData.append("avatar", formData.avatar);
      }

      const response = await updateProfile(profileData);

      if (response?.success) {
        toast({ title: "Success", description: "Profile updated successfully!" });
        setIsEditing(false);
        setFormData(prev => ({ ...prev, avatar: null }));
      } else {
        toast({ title: "Error", description: response?.message || "Failed to update profile" });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: error.message || "An error occurred while updating profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
        city: user.city || "",
        country: user.country || "",
        permissions: user.admin?.permissions?.join(", ") || "",
        is_super_admin: user.role === "super_admin",
        avatar: null,
      }));

      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
    setIsEditing(false);
  };

  const AvatarModal = () => (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={() => setShowAvatarModal(false)}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowAvatarModal(false)}
          className="absolute top-4 right-4 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center justify-center">
          <img
            src={avatarPreview}
            alt="Profile Avatar"
            className="w-full max-w-md rounded-lg object-cover shadow-lg"
          />
          <p className="mt-6 text-slate-600 text-center">
            {formData.first_name} {formData.last_name}
          </p>
        </div>
      </div>
    </div>
  );

  React.useEffect(() => {
    if (showAvatarModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAvatarModal]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 md:p-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">
            {isEditing ? "Edit your profile information" : "View and manage your profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar Section */}
          <div className="lg:col-span-1">
            <Card className="h-full sticky top-8">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center">
                  {/* Avatar Image */}
                  <div className="relative w-48 h-48 mb-6">
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="relative w-full h-full group cursor-pointer"
                      type="button"
                    >
                      <img
                        src={
                          avatarPreview ||
                          `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=random&size=200`
                        }
                        alt="Profile Avatar"
                        className="w-full h-full rounded-lg object-cover shadow-lg border-4 border-primary/10 group-hover:opacity-75 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="bg-black/50 text-white p-3 rounded-full">
                          <ZoomIn className="w-6 h-6" />
                        </div>
                      </div>
                    </button>
                    {isEditing && (
                      <label className="absolute bottom-2 right-2 bg-primary text-white p-3 rounded-lg cursor-pointer hover:bg-primary/90 transition shadow-lg">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>

                  {/* User Info Summary */}
                  <div className="text-center mb-6 w-full">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {formData.first_name} {formData.last_name}
                    </h2>
                    <p className="text-slate-600 text-sm">{user?.email}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Platform Administrator
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-slate-200 my-6"></div>

                  {/* Admin Status */}
                  <div className="w-full space-y-4">
                    <div className="text-center">
                      <p className="text-slate-500 text-sm">Status</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formData.is_super_admin ? "Super Admin" : "Admin"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Columns: Form Fields */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="First name"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="Last name"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <Input
                        value={formData.email}
                        disabled
                        placeholder="Email"
                        className="h-10 bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        City
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="City"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Country
                      </label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="Country"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200"></div>

                {/* Admin Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Administrator Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Permissions
                      </label>
                      <Input
                        name="permissions"
                        value={formData.permissions}
                        disabled
                        placeholder="All permissions"
                        className="h-10 bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Admin Level
                      </label>
                      <div className="px-4 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium">
                        {formData.is_super_admin ? "Super Administrator" : "Administrator"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer with Action Buttons */}
              <CardFooter className="flex justify-end gap-4 pt-8 border-t">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Edit Profile"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showAvatarModal && <AvatarModal />}
    </div>
  );
};

export default AdminProfile;
