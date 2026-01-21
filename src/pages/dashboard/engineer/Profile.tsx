import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, FileText, Loader2, X, ZoomIn } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from '@/hooks/use-toast';
import { useAuthContext } from "../../../hooks/useAuthContext";

// Utility function to extract filename from object path
const extractFilename = (objectPath: string): string => {
  if (!objectPath) return "Resume";
  const parts = objectPath.split("__");
  return parts[parts.length - 1];
};

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  city: string;
  country: string;
  years_of_experience: string;
  skill_level: string;
  specialization: string;
  project_types: string;
  availability: string;
  avatar: File | null;
  avatar_preview: string;
  cv_file: File | null;
  cv_name: string;
}

const Profile = () => {
  const { user, updateProfile, authLoading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvUrl, setCvUrl] = useState<string>("");

  // Initialize form data from user object
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    city: "",
    country: "",
    years_of_experience: "",
    skill_level: "",
    specialization: "",
    project_types: "",
    availability: "available",
    avatar: null,
    avatar_preview: "",
    cv_file: null,
    cv_name: "",
  });

  // Populate form with user data on mount
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
        years_of_experience: user.engineer?.years_of_experience?.toString() || "",
        skill_level: user.engineer?.skill_level || "",
        specialization: user.engineer?.specialization?.join(", ") || "",
        project_types: user.engineer?.project_types?.join(", ") || "",
        availability: user.engineer?.availability || "available",
        cv_name: user.engineer?.cv_object_name || "",
      }));

      // Set avatar preview from user's current avatar
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
      
      // Set CV URL if available
      if (user.engineer?.cv_url) {
        setCvUrl(user.engineer.cv_url);
      }
    }
  }, [user]);

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({title: "Error",description:"Please select an image file"});
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size must be less than 2MB" });
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle CV file selection
  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "Please select a PDF or Word document" });
        return;
      }

      // Validate file size (10MB max for documents)
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 2MB" });
        return;
      }

      setFormData(prev => ({ ...prev, cv_file: file }));
      toast({ title: "Success", description: `Resume selected: ${file.name}` });
    }
  };

  // Handle CV removal
  const handleCVRemove = () => {
    setFormData(prev => ({ ...prev, cv_file: null }));
    toast({ title: "Info", description: `Resume removed` });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({ title: "Info", description: `First name and last name are required` });
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const profileData = new FormData();

      // Add personal info fields
      profileData.append("first_name", formData.first_name.trim());
      profileData.append("last_name", formData.last_name.trim());
      profileData.append("phone_number", formData.phone_number);
      profileData.append("city", formData.city);
      profileData.append("country", formData.country);

      // Add professional info fields
      if (formData.years_of_experience) {
        profileData.append("years_of_experience", formData.years_of_experience);
      }
      if (formData.skill_level) {
        profileData.append("skill_level", formData.skill_level);
      }
      if (formData.specialization) {
        profileData.append("specialization", formData.specialization);
      }
      if (formData.project_types) {
        profileData.append("project_types", formData.project_types);
      }
      profileData.append("availability", formData.availability);

      // Add avatar file if changed
      if (formData.avatar) {
        profileData.append("avatar", formData.avatar);
      }

      // Add CV file if changed
      if (formData.cv_file) {
        profileData.append("cv_file", formData.cv_file);
      }

      // // Log FormData for debugging
      // console.log("📝 Submitting profile update with FormData:");
      // for (const [key, value] of profileData.entries()) {
      //   if (value instanceof File) {
      //     console.log(`  ${key}: File - ${value.name} (${value.size} bytes)`);
      //   } else {
      //     console.log(`  ${key}: ${value}`);
      //   }
      // }

      // Call backend update
      const response = await updateProfile(profileData);

      // console.log("✅ Profile update response:", response);

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
    // Reset form data to original user values
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
        city: user.city || "",
        country: user.country || "",
        years_of_experience: user.engineer?.years_of_experience?.toString() || "",
        skill_level: user.engineer?.skill_level || "",
        specialization: user.engineer?.specialization?.join(", ") || "",
        project_types: user.engineer?.project_types?.join(", ") || "",
        availability: user.engineer?.availability || "available",
        avatar: null,
        cv_file: null,
        cv_name: user.engineer?.cv_object_name || "",
      }));

      // Reset avatar preview
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
    setIsEditing(false);
  };

  // Avatar Modal Component
  const AvatarModal = () => (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={() => setShowAvatarModal(false)}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowAvatarModal(false)}
          className="absolute top-4 right-4 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal content */}
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

  // CV Modal Component
  const CVModal = () => (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={() => setShowCVModal(false)}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowCVModal(false)}
          className="absolute top-4 right-4 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-slate-100 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-slate-900">
            {extractFilename(formData.cv_name)}
          </h3>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto">
          {cvUrl && (
            <iframe
              src={`${cvUrl}#toolbar=0`}
              className="w-full h-full min-h-[500px]"
              title="CV Document"
            />
          )}
        </div>

        {/* Footer with download option */}
        <div className="bg-slate-100 px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-slate-600">
            {extractFilename(formData.cv_name)}
          </p>
          {cvUrl && (
            <a
              href={cvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // Prevent body scroll when modals are open
  React.useEffect(() => {
    if (showAvatarModal || showCVModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAvatarModal, showCVModal]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                      {/* Zoom icon overlay */}
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
                    <div className="mt-3 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                      {formData.availability}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-slate-200 my-6"></div>

                  {/* Quick Stats */}
                  <div className="w-full space-y-4">
                    <div className="text-center">
                      <p className="text-slate-500 text-sm">Years of Experience</p>
                      <p className="text-2xl font-bold text-primary">
                        {formData.years_of_experience || "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-sm">Skill Level</p>
                      <p className="text-lg font-semibold text-slate-900 capitalize">
                        {formData.skill_level || "Not specified"}
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
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled
                        placeholder="First name"
                        className="h-10"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled
                        placeholder="Last name"
                        className="h-10"
                      />
                    </div>

                    {/* Email (Read-only) */}
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

                    {/* Phone */}
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

                    {/* City */}
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

                    {/* Country */}
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

                {/* Professional Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Years of Experience */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Years of Experience
                      </label>
                      <Input
                        name="years_of_experience"
                        type="number"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="0"
                        className="h-10"
                        min="0"
                        max="70"
                      />
                    </div>

                    {/* Skill Level */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Skill Level
                      </label>
                      <Select
                        value={formData.skill_level}
                        onValueChange={(value) =>
                          handleSelectChange("skill_level", value)
                        }
                        disabled={!isEditing || loading}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Availability
                      </label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) =>
                          handleSelectChange("availability", value)
                        }
                        disabled={!isEditing || loading}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Specialization
                      </label>
                      <Input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="e.g., React, Node.js, Python"
                        className="h-10"
                      />
                    </div>

                    {/* Project Types */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Project Types
                      </label>
                      <Input
                        name="project_types"
                        value={formData.project_types}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="e.g., Web Development, Mobile, DevOps"
                        className="h-10"
                      />
                    </div>

                    {/* CV/Resume Upload */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Resume/CV
                      </label>
                      <div className="flex gap-3">
                        {!formData.cv_file && !formData.cv_name ? (
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                            <FileText className="w-5 h-5 text-slate-600" />
                            <span className="text-sm font-medium text-slate-600">
                              {isEditing ? "Choose PDF or Word document" : "No resume uploaded"}
                            </span>
                            {isEditing && (
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleCVChange}
                                className="hidden"
                                disabled={loading}
                              />
                            )}
                          </label>
                        ) : (
                          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <button
                              type="button"
                              onClick={() => setShowCVModal(true)}
                              className="flex-1 min-w-0 text-left hover:opacity-75 transition"
                            >
                              <p className="text-sm font-medium text-green-900 truncate hover:text-green-700 underline cursor-pointer">
                                {extractFilename(formData.cv_file?.name || formData.cv_name || "Resume")}
                              </p>
                              {formData.cv_file && (
                                <p className="text-xs text-green-700">
                                  {(formData.cv_file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </button>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={handleCVRemove}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                        {isEditing && !formData.cv_file && (
                          <label className="px-4 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition font-medium text-sm whitespace-nowrap">
                            Browse
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleCVChange}
                              className="hidden"
                              disabled={loading}
                            />
                          </label>
                        )}
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
                  className="gap-2"
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
      {showCVModal && <CVModal />}
    </div>
  );
};

export default Profile;
