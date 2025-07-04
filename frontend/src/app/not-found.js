"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Animated 404 Text */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-9xl font-bold text-green-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-gray-500">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative h-64"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full bg-green-100 opacity-30 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-green-200 opacity-40 animate-pulse delay-100"></div>
              <div className="absolute inset-8 rounded-full bg-green-300 opacity-50 animate-pulse delay-200"></div>
              <div className="absolute inset-12 flex items-center justify-center rounded-full bg-white border-4 border-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/" className="flex items-center gap-2">
              <MoveLeft className="h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}