"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
    previewImage: null, // For previewing the uploaded photo
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      const file = files[0];
      setFormData({
        ...formData,
        photo: file,
        previewImage: URL.createObjectURL(file),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      // Make POST request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/signup`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Include cookies for session management
        }
      );

      if(response.status === 201){
        console.log("Signup successful:", response.data);
        toast.success("Account created successfully!");
        router.push("/dashboard"); 
        
      }else{
        toast.info(response.data.message); // Show any message returned from the server
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred during signup. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4 pt-16">
      <Card className="w-full max-w-md shadow-lg border-green-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">
            Create an account
          </CardTitle>
          <CardDescription>
            Join us and start managing your finances efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-4">
                {formData.previewImage ? (
                  <Image
                    src={formData.previewImage}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover border-2 border-green-200"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
                    <span className="text-green-500 text-lg">Photo</span>
                  </div>
                )}
              </div>
              <Label
                htmlFor="profilePhoto"
                className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
              >
                Upload Photo (limit 2MB)
                <Input
                  id="profilePhoto"
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </Label>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
                className="focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Password Field with Show/Hide */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <Button
              type="submit"
              className="w-full cursor-pointer bg-green-600 hover:bg-green-700 transition"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                variant="link"
                className="text-green-600 cursor-pointer hover:text-green-700 p-0 h-auto"
                onClick={() => router.push("/signin")}
              >
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}