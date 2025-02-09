import React from 'react';
import { AlertCircle, Link } from 'lucide-react';

export function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center flex flex-col justify-center items-center">
        <div className="mx-auto h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          Please make sure you are signed in!
        </p>
        <a className='w-[30%] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors' href="http://localhost:3000/auth/signin">
        Sign in</a>
        
        {/* <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-sm font-medium text-gray-900 mb-2">Why do we need cookies?</h2>
            <p className="text-sm text-gray-600">
              Cookies are essential for maintaining your session and ensuring a secure connection to our services.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        </div> */}
      </div>
    </div>
  );
}