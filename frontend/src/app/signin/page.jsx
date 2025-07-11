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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        formData,
        { 
          withCredentials: true,
          timeout: 10000 // 10 seconds timeout
        }
      );
      
      if (response.status === 200) {
        toast.success("Login successful!");
        router.push("/dashboard"); // Redirect to dashboard
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg border-green-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to access your financial dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="link"
                className="text-green-600 hover:text-green-700 p-0 h-auto text-sm"
                asChild
                disabled={isLoading}
              >
                <Link href="/forgot-password">Forgot password?</Link>
              </Button>
            </div>

            <Separator className="my-6" />

            <Button
              type="submit"
              className="w-full bg-green-600 cursor-pointer hover:bg-green-700 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="text-green-600 cursor-pointer hover:text-green-700 p-0 h-auto"
                asChild
                disabled={isLoading}
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}