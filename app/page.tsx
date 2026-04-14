"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  Star,
  Shield,
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

export default function Home() {
  return (
    <main className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-blue-600/20">
              <Sparkles className="h-3.5 w-3.5" />
              Freelance Marketplace
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              SkillBridge — Connect, Work, Succeed
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              The all-in-one freelancing platform for clients and freelancers.
              Post projects, find talent, collaborate securely, and get paid —
              all in one place.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Post Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Describe your project and get proposals from top freelancers.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-blue-600" />
                    Find Talent
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Browse skilled freelancers and review their portfolios.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-4 w-4 text-blue-600" />
                    Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Build trust with verified feedback and star ratings.
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8"
          >
            Everything you need to freelance successfully
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 h-full">
                <CardHeader>
                  <CardTitle className="text-base">For Clients</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Post any project – from design to development.</p>
                  <p>✓ Review proposals, portfolios, and ratings.</p>
                  <p>✓ Release payments only when you&apos;re satisfied.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 h-full">
                <CardHeader>
                  <CardTitle className="text-base">For Freelancers</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Build your profile and showcase your work.</p>
                  <p>✓ Submit proposals and win projects.</p>
                  <p>✓ Get paid on time, every time.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 h-full">
                <CardHeader>
                  <CardTitle className="text-base">Trust & Safety</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Verified identities and dispute resolution center.</p>
                  <p>✓ Escrow protection and transparent reviews.</p>
                  <p>✓ 24/7 support for all users.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer - static, no links */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">SkillBridge</h3>
              <p className="text-sm text-muted-foreground">
                Connecting talented freelancers with great clients. Your success is our mission.
              </p>
              <div className="flex space-x-4 pt-2">
                <span className="text-muted-foreground">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </span>
                <span className="text-muted-foreground">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </span>
                <span className="text-muted-foreground">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </span>
                <span className="text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Post a Project</li>
                <li>Find Freelancers</li>
                <li>How It Works</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Create Profile</li>
                <li>Browse Projects</li>
                <li>Getting Started</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}