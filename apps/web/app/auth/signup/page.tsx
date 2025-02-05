"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { notify } from "../../../utils";
import { useRouter } from "next/navigation";

const Signup = () => {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  async function handleSignUp() {
    try {
      const username = usernameRef.current?.value;
      const password = passwordRef.current?.value;
      const email = emailRef.current?.value;

      if (!username || !password || !email) {
        notify("Please fill in all required fields", false);
        return;
      }

      const response = await axios.post("http://localhost:3002/api/v1/signup", {
        username,
        password,
        email,
      });
      console.log(response);
      if (response.status === 200) {
        router.push("/auth/signin");
        notify("Signup successful!", true);
      }
    } catch (err: any) {
      console.log("Error: " + JSON.stringify(err.response));
      let errorString = "";
      if (!Array.isArray(err.response.data.message)) {
        errorString = err.response.data.message;
      } else {
        for (let errMsg of err.response.data.message) {
          errorString += errMsg.message + "\n";
        }
      }
      console.log("Error signing up: " + errorString);
      notify("Sorry, please try again!", false);
    }
  }

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        Register
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

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full py-3 px-4 bg-transparent border hover:border-0 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium mt-6"
          onClick={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a
          href="/auth/signin"
          className="text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign in
        </a>
      </p>
    </div>
    // </div>
  );
};

export default Signup;
