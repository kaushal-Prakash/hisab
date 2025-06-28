"use client";
import axios from "axios";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function Navbar() {
  const path = usePathname();
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [avatar, setAvatar] = useState("/default-avatar.png");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/user/is-authenticated",
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setAuthenticated(true);
          console.log(response.data);
          setAvatar(response.data.imageUrl || "/default-avatar.png");
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Check if current path is signin or signup
  const isAuthPage = path === "/signin" || path === "/signup";

  return (
    <div className="fixed top-0 flex w-full justify-center z-50 pt-4">
      <div className="max-w-7xl flex items-center justify-between h-16 px-8 py-2 bg-white shadow-md gap-4 rounded-3xl border-2 border-green-100 ">
        <div className="flex items-center gap-4">
          {isAuthPage && (
            <Link href="/" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-black transition" />
            </Link>
          )}
          <Link href="/">
            <Image
              src="/logo-transparent.png"
              alt="hisab logo"
              width={100}
              height={100}
              className="cursor-pointer object-contain h-20"
            />
          </Link>
        </div>
        {path == "/" && (
          <div className="hidden md:flex md:items-center md:gap-4 font-semibold text-sm ">
            <Link href="#features" className="hover:underline underline-offset-2 transition duration-300">Features</Link>
            <Link href="#how-it-works" className="hover:underline underline-offset-2 transition duration-300">How it works</Link>
          </div>
        )}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex md:hidden font-semibold text-sm rounded-full transition justify-center items-center hover:underline underline-offset-2 duration-300 active:translate-y-0.5"
              >
                <LayoutDashboard className="h-5 w-5 inline-block mr-1" />
              </Link>
              <Link
                href="/dashboard"
                className="md:flex hidden font-semibold text-sm rounded-full transition justify-center items-center hover:underline underline-offset-2 duration-300 active:translate-y-0.5"
              >
                <LayoutDashboard className="h-5 w-5 inline-block mr-1" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="rounded-full transition flex justify-center items-center"
              >
                <Image
                  src={avatar}
                  alt="profile picture"
                  width={30}
                  height={30}
                  className="rounded-full h-8 w-8 object-cover mr-1"
                />
              </Link>
            </>
          ) : (
            <>
              {!isAuthPage && (
                <>
                  <Link
                    href="/signin"
                    className="bg-green-600 shadow-inner font-semibold text-white px-4 py-2 rounded-full hover:bg-black hover:text-green-100 hover:translate-0.5 active:-translate-0.5 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white border-2 shadow-inner border-green-600 font-semibold text-green-600 px-4 py-2 rounded-full hover:bg-black hover:text-green-100 hover:translate-0.5 active:-translate-0.5 hover:border-0 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;