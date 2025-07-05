"use client";
import axios from "axios";
import {
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  LucideContactRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const path = usePathname();
  const [authStatus, setAuthStatus] = useState("loading");
  const [avatar, setAvatar] = useState("/default-avatar.png");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/user/is-authenticated",
          { withCredentials: true }
        );
        if (response.status === 200) {
          setAuthStatus("authenticated");
          const fetchedAvatar = response.data.user.imageUrl;
          setAvatar(
            fetchedAvatar && fetchedAvatar.trim() !== ""
              ? fetchedAvatar
              : "/default-avatar.png"
          );
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthStatus("unauthenticated");
      }
    };

    checkAuth();
  }, [path]);

  const isAuthPage = path === "/signin" || path === "/signup";

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/user/signout",
        { withCredentials: true }
      );
      if (response.status === 200) {
        setAuthStatus("unauthenticated");
        setAvatar("/default-avatar.png");
        window.location.href = "/signin";
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 w-full z-50 pt-4 px-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-8 py-2 bg-white shadow-md gap-4 rounded-3xl border-2 border-green-100"
      >
        <div className="flex items-center gap-4">
          {isAuthPage && (
            <Link href="/">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-black transition" />
              </motion.div>
            </Link>
          )}
          <Link href="/">
            <motion.div whileHover={{ scale: 1.03 }}>
              <Image
                src="/logo-transparent.png"
                alt="hisab logo"
                width={100}
                height={100}
                className="cursor-pointer object-contain h-12 sm:h-16"
              />
            </motion.div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-black focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {path === "/" && (
            <div className="flex w-fit items-center gap-6 font-semibold text-sm">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="#features"
                  className="hover:underline underline-offset-4 transition"
                >
                  Features
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="#how-it-works"
                  className="hover:underline underline-offset-4 transition"
                >
                  How it works
                </Link>
              </motion.div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {authStatus === "authenticated" ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/contacts"
                    className="flex font-semibold text-sm rounded-full items-center hover:underline underline-offset-4"
                  >
                    <LucideContactRound className="h-5 w-5 mr-1" />
                    Contacts
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/dashboard"
                    className="flex font-semibold text-sm rounded-full items-center hover:underline underline-offset-4"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-1" />
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link href="/profile">
                    <Image
                      src={avatar}
                      alt="profile picture"
                      width={32}
                      height={32}
                      className="rounded-full h-8 w-8 object-cover border-2 border-green-100"
                    />
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-600 hover:text-black transition"
                  title="Logout"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/signin"
                      className="bg-green-600 font-semibold text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/signup"
                      className="bg-white border-2 border-green-600 font-semibold text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {path === "/" && (
                <>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="border-b border-gray-100 pb-2"
                  >
                    <Link
                      href="#features"
                      className="block py-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Features
                    </Link>
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="border-b border-gray-100 pb-2"
                  >
                    <Link
                      href="#how-it-works"
                      className="block py-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      How it works
                    </Link>
                  </motion.div>
                </>
              )}

              {authStatus === "authenticated" ? (
                <>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="border-b border-gray-100 pb-2"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center py-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="border-b border-gray-100 pb-2"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center py-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Image
                        src={avatar}
                        alt="profile picture"
                        width={24}
                        height={24}
                        className="rounded-full h-6 w-6 object-cover mr-2"
                      />
                      Profile
                    </Link>
                  </motion.div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center py-2 text-red-500 font-medium"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </motion.button>
                </>
              ) : (
                !isAuthPage && (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="border-b border-gray-100 pb-2"
                    >
                      <Link
                        href="/signin"
                        className="block py-2 font-medium text-center bg-green-600 text-white rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/signup"
                        className="block py-2 font-medium text-center border-2 border-green-600 text-green-600 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;
