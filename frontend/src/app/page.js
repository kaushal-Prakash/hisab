"use client";
import Link from "next/link";
import { 
  ArrowRight, 
  SplitSquareVertical,
  Percent,
  Users,
  Wallet,
  Bell,
  FileText,
  BarChart2,
  CheckCircle,
  MessageSquare,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { motion } from "motion/react";
import { fadeIn, staggerContainer } from "@/lib/motion";

// Features data
const FEATURES = [
  {
    title: "Expense Tracking",
    Icon: FileText,
    bg: "bg-green-100",
    color: "text-green-600",
    description: "Track all shared expenses in one place with your friends and family."
  },
  {
    title: "Smart Splitting",
    Icon: SplitSquareVertical,
    bg: "bg-blue-100",
    color: "text-blue-600",
    description: "Automatically split bills equally or by custom percentages."
  },
  {
    title: "Debt Simplification",
    Icon: Percent,
    bg: "bg-purple-100",
    color: "text-purple-600",
    description: "Our algorithm minimizes transactions between group members."
  },
  {
    title: "Group Management",
    Icon: Users,
    bg: "bg-orange-100",
    color: "text-orange-600",
    description: "Create groups for roommates, trips, or regular outings."
  },
  {
    title: "Payment Tracking",
    Icon: Wallet,
    bg: "bg-red-100",
    color: "text-red-600",
    description: "Record payments and see who's settled up."
  },
  {
    title: "Reminders",
    Icon: Bell,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
    description: "Get notified when it's time to settle debts."
  }
];

const STEPS = [
  {
    label: "1",
    title: "Create a group",
    description: "Add friends, roommates, or trip buddies to your Hisab group."
  },
  {
    label: "2",
    title: "Add expenses",
    description: "Enter shared expenses and specify who paid and who owes."
  },
  {
    label: "3",
    title: "Settle up",
    description: "See who owes whom and record payments with one click."
  }
];

const TESTIMONIALS = [
  {
    quote: "Hisab saved our friendship! No more awkward money conversations after trips.",
    name: "Priya Sharma",
    role: "Frequent traveler",
    image: ""
  },
  {
    quote: "As a roommate, this app has eliminated all our bill-splitting headaches.",
    name: "Rahul Patel",
    role: "College student",
    image: ""
  },
  {
    quote: "I use Hisab for my monthly dinners with friends. It's a game-changer!",
    name: "Neha Gupta",
    role: "Food enthusiast",
    image: ""
  }
];

export default function Home() {
  return (
    <div className="flex flex-col pt-16">
      {/* ───── Hero ───── */}
      <section className="mt-20 pb-12 space-y-10 md:space-y-15 px-5">
        <motion.div 
          className="container mx-auto px-4 md:px-6 text-center space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)}>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Split expenses. Simplify life.
            </Badge>
          </motion.div>

          <motion.h1 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="gradient-title mx-auto max-w-6xl text-4xl font-bold md:text-8xl"
          >
            The smartest way to split expenses with friends
          </motion.h1>

          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed"
          >
            Track shared expenses, split bills effortlessly, and settle up quickly. Never worry about who owes who again.
          </motion.p>

          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="flex flex-col items-center gap-4 sm:flex-row justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="container mx-auto max-w-5xl overflow-hidden rounded-xl"
          variants={fadeIn('up', 'tween', 0.5, 1)}
        >
          <div className="p-1">
            <Image
              src="/bg.png"
              width={500}
              height={500}
              alt="Hisab app dashboard preview"
              className="rounded-lg mx-auto"
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* ───── Features ───── */}
      <section id="features" className="bg-gray-50 py-20">
        <motion.div 
          className="container mx-auto px-4 md:px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)}>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Features
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeIn('up', 'tween', 0.2, 1)} className="gradient-title mt-2 text-3xl md:text-4xl">
            Everything you need to split expenses
          </motion.h2>
          <motion.p variants={fadeIn('up', 'tween', 0.3, 1)} className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
            Our platform provides all the tools you need to handle shared expenses with ease.
          </motion.p>

          <motion.div 
            variants={staggerContainer}
            className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ title, Icon, bg, color, description }, index) => (
              <motion.div
                key={title}
                variants={fadeIn('up', 'tween', index * 0.1 + 0.4, 1)}
              >
                <Card className="flex flex-col items-center space-y-4 p-6 text-center h-full hover:shadow-lg transition-shadow">
                  <div className={`rounded-full p-3 ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-gray-500">{description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ───── How it works ───── */}
      <section id="how-it-works" className="py-20">
        <motion.div 
          className="container mx-auto px-4 md:px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)}>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              How It Works
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeIn('up', 'tween', 0.2, 1)} className="gradient-title mt-2 text-3xl md:text-4xl">
            Splitting expenses has never been easier
          </motion.h2>
          <motion.p variants={fadeIn('up', 'tween', 0.3, 1)} className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
            Follow these simple steps to start tracking and splitting expenses with friends.
          </motion.p>

          <motion.div 
            variants={staggerContainer}
            className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3"
          >
            {STEPS.map(({ label, title, description }, index) => (
              <motion.div 
                key={label}
                variants={fadeIn('up', 'tween', index * 0.1 + 0.4, 1)}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                  {label}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500 text-center">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="bg-gray-50 py-20">
        <motion.div 
          className="container mx-auto px-4 md:px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)}>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Testimonials
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeIn('up', 'tween', 0.2, 1)} className="gradient-title mt-2 text-3xl md:text-4xl">
            What our users are saying
          </motion.h2>

          <motion.div 
            variants={staggerContainer}
            className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {TESTIMONIALS.map(({ quote, name, role }, index) => (
              <motion.div
                key={name}
                variants={fadeIn('up', 'tween', index * 0.1 + 0.3, 1)}
              >
                <Card className="flex flex-col justify-between h-full">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-center text-green-500 mb-4">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-gray-500">{quote}</p>
                    <div className="flex items-center space-x-3 mt-4">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-600 uppercase">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-sm text-muted-foreground">{role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ───── Stats ───── */}
      <section className="py-12 bg-white">
        <motion.div 
          className="container mx-auto px-4 md:px-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-green-600">10K+</h3>
              <p className="text-gray-500">Users</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-green-600">500K+</h3>
              <p className="text-gray-500">Expenses tracked</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-green-600">1M+</h3>
              <p className="text-gray-500">Settlements</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-green-600">100+</h3>
              <p className="text-gray-500">Countries</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ───── Call‑to‑Action ───── */}
      <section className="py-20 gradient">
        <motion.div 
          className="container mx-auto px-4 md:px-6 text-center space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-3xl font-extrabold tracking-tight md:text-4xl text-green-500"
          >
            Ready to simplify expense sharing?
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="mx-auto max-w-[600px] text-green-500 md:text-xl/relaxed"
          >
            Join thousands of users who have made splitting expenses stress free.
          </motion.p>
          <motion.div variants={fadeIn('up', 'tween', 0.3, 1)}>
            <Button asChild size="lg" className="bg-green-800 hover:opacity-90">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t bg-gray-50 py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} hisab. All rights reserved.
      </footer>
    </div>
  );
}