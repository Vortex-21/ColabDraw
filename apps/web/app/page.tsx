import styles from "./page.module.css";

import { Button } from "@repo/ui/button";
import SignUp from "./components/signup";



import React from 'react';
import UsersIcon from "./icons/UsersIcon";
import LightningIcon from "./icons/LightningIcon";
import ShareIcon from "./icons/ShareIcon";
import Logo from "./icons/Logo";
import { redirect} from "next/navigation"
import Link from "next/link";
// import { Link } from "lucide-react";
// import { PenLine, Users, Zap, Share2, Palette } from 'lucide-react';

export default function App() {
  // const router = useRouter(); 
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* <PenLine className="h-8 w-8 text-violet-500" /> */}
              <Logo></Logo>
              <span className="ml-2 text-xl font-bold text-white">ColabDraw</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* <Link onClick={() => {redirect('/auth/signin')}}className="px-4 py-2 text-gray-300 hover:text-white font-medium hover:border-2 rounded-lg">
                Sign In
              </Link> */}
              <Link href="/auth/signin" className="px-4 py-2 text-gray-300 hover:text-white font-medium hover:border-2 rounded-lg">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
              Collaborate and Create
              <span className="text-violet-500"> Together</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              The most intuitive whiteboard for teams. Draw, brainstorm, and collaborate in real-time, anywhere in the world.
            </p>
            {/* <div className="mt-10">
              <button className="px-8 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-lg font-medium">
                Start Drawing Now
              </button>
            </div> */}
          </div>

          {/* Feature Preview */}
          <div className="mt-16 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2400&q=80"
                alt="Collaborative drawing interface"
                className="w-full h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-900/50 rounded-xl inline-flex items-center justify-center">
                {/* <Users className="h-6 w-6 text-violet-400" /> */}
                <UsersIcon/>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Real-time Collaboration</h3>
              <p className="mt-2 text-gray-300">
                Work together with your team in real-time, seeing changes instantly as they happen.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-900/50 rounded-xl inline-flex items-center justify-center">
                {/* <Zap className="h-6 w-6 text-violet-400" /> */}
                <LightningIcon/>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Lightning Fast</h3>
              <p className="mt-2 text-gray-300">
                Experience smooth, lag-free drawing with our optimized canvas technology.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-900/50 rounded-xl inline-flex items-center justify-center">
                {/* <Share2 className="h-6 w-6 text-violet-400" /> */}
                <ShareIcon/>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Easy Sharing</h3>
              <p className="mt-2 text-gray-300">
                Share your drawings with a simple link, no sign-up required for viewers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-violet-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to bring your ideas to life?
          </h2>
          <p className="mt-4 text-xl text-violet-200">
            Join thousands of teams already using ColabDraw to collaborate better.
          </p>
          <button className="mt-8 px-8 py-4 bg-white text-violet-900 rounded-lg hover:bg-violet-100 transition-colors text-lg font-medium">
            Get Started for Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <PenLine className="h-8 w-8 text-violet-500" /> */}
              <span className="ml-2 text-xl font-bold text-white">ColabDraw</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-sm text-center">
            © 2024 ColabDraw. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}



