"use client";
import React, { useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { notify } from "../../../utils";
export default function SignIn() {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  async function handleSignIn() {
    // e.preventDefault();
    // console.log("Signing in...");
    try {
      const password = passwordRef.current?.value;
      const username = usernameRef.current?.value;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HTTP_BASE}/api/v1/signin`,
        { username, password },
        { withCredentials: true }
      );
      console.log("response : " + response);
      if (response.status === 200) {
        router.push("/lobby/");
      } else {
        //   alert("Invalid credentials");
        notify("Invalid credentials", false);
      }
    } catch (err: any) {
      // alert("Invalid credentials");
      notify("Invalid credentials", false);

      console.log("Error : ", err);
    }
  }

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        Welcome back
      </h1>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Username
          </label>
          <input
            autoComplete="username"
            required
            ref={usernameRef}
            type="text"
            id="username"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            required
            ref={passwordRef}
            type="password"
            id="password"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        {/* <div className="flex items-center justify-between">
                <div className="flex items-center">
                <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                </label>
                </div>
                <a href="#" className="text-sm text-violet-400 hover:text-violet-300">
                Forgot password?
                </a>
            </div> */}

        <button
          type="submit"
          className="cursor-pointer w-full py-3 px-4 bg-transparent border hover:border-0 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium mt-6"
          onClick={(e) => {
            e.preventDefault();
            handleSignIn();
          }}
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <a
          href="/auth/signup"
          className="text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign up
        </a>
      </p>
    </div>
    // </div>
  );
}

// export default SignIn;
