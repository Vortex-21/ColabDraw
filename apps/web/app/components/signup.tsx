// "use client"
// import React, { useState, useRef } from 'react';
// // import { UserPlus, Upload } from 'lucide-react';

import { useRef } from "react";

// export default function SignUp() {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     name: '',
//   });
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle sign up logic here
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         alert('File size must be less than 5MB');
//         return;
//       }

//       if (!file.type.startsWith('image/')) {
//         alert('Please upload an image file');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           {/* <UserPlus className="h-12 w-12 text-indigo-600 mx-auto mb-4" /> */}
//           <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
//           <p className="text-gray-600 mt-2">Join us today!</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <input
//               id="name"
//               type="text"
//               required
//               className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
//               placeholder="Enter your full name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             />
//           </div>

//           <div>
//             <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               id="username"
//               type="text"
//               required
//               className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
//               placeholder="Choose a username"
//               value={formData.username}
//               onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               required
//               className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
//               placeholder="Create a strong password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Profile Picture
//             </label>
//             <div 
//               onClick={() => fileInputRef.current?.click()}
//               className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors duration-150"
//             >
//               <div className="space-y-1 text-center">
//                 {/* <Upload className="mx-auto h-12 w-12 text-gray-400" /> */}
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     htmlFor="file-upload"
//                     className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
//                   >
//                     <span>Upload a file</span>
//                     <input
//                       id="file-upload"
//                       name="file-upload"
//                       type="file"
//                       className="sr-only"
//                       accept="image/*"
//                       ref={fileInputRef}
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
//               </div>
//             </div>
//           </div>

//           {previewImage && (
//             <div className="flex justify-center">
//               <img
//                 src={previewImage}
//                 alt="Profile preview"
//                 className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500"
//               />
//             </div>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
//           >
//             Create Account
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Already have an account?{' '}
//           <a href="#signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
//             Sign in
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

export default function SignUp(){ 
    function handleFileChange(){ 

    }
    const fileInputRef = useRef<HTMLInputElement | null>(null); 
    return ( 
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col items-center justify-center">
                <input type="text" placeholder="Username"/>
                <input type="text" placeholder="Password"/>
                <div>
                    <input type="file" className="sr-only" accept="image/*"  ref={fileInputRef} onChange={handleFileChange}/>

                </div>

            </div>
        </div>
    )
}