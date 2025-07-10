"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Users,
  Globe,
  Calendar,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Edit,
  Camera,
  X,
  Check,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";

function Page() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState({
    contacts: true,
    groups: true,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/get-user`,
        {
          withCredentials: true,
        }
      );
      setUser(userResponse.data.user);
      setNewName(userResponse.data.user.name);

      // Fetch contacts
      const contactsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/get-contacts`,
        {
          withCredentials: true,
        }
      );
      setContacts(contactsResponse.data);

      // Fetch groups
      const groupsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/groups/get-user-groups`,
        { withCredentials: true }
      );
      setGroups(groupsResponse.data);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setIsUpdating(true);
      const updateResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/change-name`,
        { newName: newName },
        { withCredentials: true }
      );

      if (updateResponse.status !== 200) {
        toast.error("Failed to update name");
      }

      setNewName("");
      setIsEditingName(false);
      setUser((prev) => ({ ...prev, name: newName }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setIsUploading(true);
      const uploadReponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/change-photo`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(uploadReponse.status !== 200) {
        toast.error("Failed to upload image");
        return;
      }
      setUser((prev) => ({ ...prev, imageUrl: uploadReponse.data.imageUrl }));
      toast.success("Image uploaded successfully");
    }catch{
      toast.error(uploadPromise.data?.message);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-24 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Skeleton */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="items-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contacts & Groups Skeleton */}
          <div className="w-full md:w-2/3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-24 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      {/* Background Image (only shown if user has imageUrl) */}
      {user?.imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full h-64 rounded-lg overflow-hidden mb-8"
        >
          <img
            src={user.imageUrl}
            alt="Profile background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Section */}
        <div className="w-full md:w-1/3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className={`relative ${user?.imageUrl ? "-mt-16" : ""}`}>
              <CardHeader className="items-center">
                <div className="flex justify-center -mt-20 mb-4">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background">
                      {user?.imageUrl ? (
                        <AvatarImage src={user.imageUrl} />
                      ) : (
                        <AvatarFallback className="text-4xl">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={triggerFileInput}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      ) : (
                        <Camera className="h-8 w-8 text-white" />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold text-center"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleNameUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user.name);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{user?.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {user?.email && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user?.phone && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}

                {user?.website && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}

                {user?.location && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}

                {user?.joinedDate && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Joined {new Date(user.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={triggerFileInput}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Contacts & Groups Section */}
        <div className="w-full md:w-2/3 space-y-6">
          {/* Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                onClick={() => toggleSection("contacts")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Contacts</CardTitle>
                </div>
                {expandedSection.contacts ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardHeader>

              {expandedSection.contacts && (
                <CardContent>
                  {contacts.length > 0 ? (
                    <div className="space-y-4">
                      {contacts.map((contact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>
                              {contact.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {contact.role || contact.email}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No contacts found
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Groups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                onClick={() => toggleSection("groups")}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <CardTitle>Groups</CardTitle>
                </div>
                {expandedSection.groups ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardHeader>

              {expandedSection.groups && (
                <CardContent>
                  {groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((group, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge variant="outline" className="px-4 py-2">
                            {group.name}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Not part of any groups
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
      <Toaster />
    </motion.div>
  );
}

export default Page;
